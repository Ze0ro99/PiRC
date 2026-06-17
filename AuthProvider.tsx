import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PiUser {
  uid: string;
  username: string;
}

interface AuthContextType {
  user: PiUser | null;
  loading: boolean;
  error: string | null;
  /** Trigger manual sign-in (shows Pi Network OAuth popup) */
  signIn: () => Promise<void>;
  signOut: () => void;
  /** Approve a payment server-side */
  approvePayment: (paymentId: string) => Promise<void>;
  /** Complete a payment server-side */
  completePayment: (paymentId: string, txid: string) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Detects the current deployment platform based on hostname.
 * Used to decide whether to run the Pi SDK in sandbox mode and to construct
 * the correct API base URL for server-side payment calls.
 */
function detectPlatform(): "vercel" | "lovable" | "replit" | "local" {
  if (typeof window === "undefined") return "local";
  const { hostname } = window.location;
  if (hostname.endsWith(".vercel.app") || hostname.endsWith(".vercel.sh")) return "vercel";
  if (hostname.endsWith(".lovable.app") || hostname.endsWith(".lovableproject.com")) return "lovable";
  if (hostname.endsWith(".replit.dev") || hostname.endsWith(".repl.co")) return "replit";
  return "local";
}

/**
 * Returns the base URL for server API calls.
 * - On Vercel / Lovable / Replit: uses a relative path so the SPA and API
 *   share the same origin (no CORS preflight needed).
 * - Allows override via VITE_API_BASE env var for custom deployments.
 */
function getApiBase(): string {
  // Allow explicit override (e.g. split frontend / backend deployments)
  const override = (import.meta as any).env?.VITE_API_BASE as string | undefined;
  if (override) return override.replace(/\/$/, "");
  // Default: relative path — works on all platforms when SPA + API share origin
  return "";
}

/** Promise with timeout that resolves or rejects after `ms` milliseconds. */
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const piSdkInitialized = useRef(false);
  const apiBase = useRef(getApiBase());

  // ── Incomplete payment callback (required by Pi SDK) ──────────────────────
  const onIncompletePaymentFound = useCallback(async (payment: any) => {
    console.warn("[PiRC Auth] Incomplete payment found:", payment?.identifier);
    try {
      await fetch(`${apiBase.current}/api/payments/incomplete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: payment?.identifier }),
      });
    } catch (e) {
      console.error("[PiRC Auth] Failed to report incomplete payment:", e);
    }
  }, []);

  // ── Core authentication logic ─────────────────────────────────────────────
  const authenticate = useCallback(
    async (isAutoAttempt: boolean) => {
      try {
        setLoading(true);
        setError(null);

        // ── Sandbox / dev fallback ──────────────────────────────────────────
        // In non-production environments where the Pi Browser SDK is not present,
        // use a deterministic mock so the team can test the full UI without
        // needing a real Pi Network account.
        const isSandbox =
          (import.meta as any).env?.VITE_PI_SANDBOX === "true" ||
          (import.meta as any).env?.MODE !== "production";

        if (typeof window.Pi === "undefined") {
          if (isSandbox) {
            console.info(
              "[PiRC Auth] Pi SDK not found — using sandbox mock user for",
              detectPlatform()
            );
            setUser({ uid: "sandbox_uid_pirc_demo", username: "pirc_demo_user" });
            setLoading(false);
            return;
          }
          throw new Error(
            "Pi Network Browser SDK is not loaded. Please open this app inside the Pi Browser."
          );
        }

        // ── Initialize Pi SDK ───────────────────────────────────────────────
        if (!piSdkInitialized.current) {
          await withTimeout(
            window.Pi.init({
              version: "2.0",
              sandbox: isSandbox,
            }),
            4000,
            "Pi SDK initialization timed out."
          );
          piSdkInitialized.current = true;
        }

        // ── Authenticate ────────────────────────────────────────────────────
        const authTimeout = isAutoAttempt ? 8000 : 30000;
        const authErrorMsg = isAutoAttempt
          ? "Auto-authentication timed out. Click 'Sign in with Pi' to try again."
          : "Authentication timed out. Please try again.";

        const auth: any = await withTimeout(
          window.Pi.authenticate(["username"], onIncompletePaymentFound),
          authTimeout,
          authErrorMsg
        );

        // ── Validate with server ────────────────────────────────────────────
        const authResponse = await fetch(`${apiBase.current}/api/auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: auth.accessToken }),
        });

        if (!authResponse.ok) {
          const body = await authResponse.json().catch(() => ({}));
          throw new Error(body?.error || "Server rejected authentication.");
        }

        const authData = await authResponse.json();

        if (authData.authenticated) {
          setUser({
            uid: authData.user.uid,
            username: auth.user.username,
          });
        } else {
          throw new Error("Server rejected the Pi Network access token.");
        }
      } catch (err: any) {
        // On auto-attempt, swallow timeout silently — user can click Sign In
        if (isAutoAttempt && err.message?.includes("timed out")) {
          console.info("[PiRC Auth] Auto-authentication timed out silently.");
        } else {
          console.error("[PiRC Auth] Error:", err.message);
          setError(err.message || "Failed to authenticate with Pi Network.");
        }
      } finally {
        setLoading(false);
      }
    },
    [onIncompletePaymentFound]
  );

  // Auto-attempt on mount
  useEffect(() => {
    authenticate(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Payment helpers exposed to child components ────────────────────────────
  const approvePayment = useCallback(async (paymentId: string) => {
    const res = await fetch(`${apiBase.current}/api/payments/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || "Failed to approve payment.");
    }
  }, []);

  const completePayment = useCallback(async (paymentId: string, txid: string) => {
    const res = await fetch(`${apiBase.current}/api/payments/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId, txid }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || "Failed to complete payment.");
    }
  }, []);

  const signIn = useCallback(() => authenticate(false), [authenticate]);

  const signOut = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signIn, signOut, approvePayment, completePayment }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>.");
  }
  return context;
}
