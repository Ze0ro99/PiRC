/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PiRC Sovereign Platform — Root Application
 *
 * Routing strategy: react-router-dom v6 BrowserRouter with a Layout wrapper
 * that handles Pi Network authentication. All platform modules are lazy-loaded
 * so the initial bundle stays lean for Vercel / Lovable / Replit cold-starts.
 */

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./AuthProvider";
import { Layout } from "./Layout";

// ─── Lazy-loaded page modules ────────────────────────────────────────────────
const Dashboard = lazy(() => import("./Dashboard"));
const RepoSync = lazy(() => import("./RepoSync").then((m) => ({ default: m.RepoSync })));
const Matrix = lazy(() => import("./Matrix").then((m) => ({ default: m.Matrix })));
const Contracts = lazy(() => import("./Contracts").then((m) => ({ default: m.Contracts })));
const Placeholder = lazy(() => import("./Placeholder").then((m) => ({ default: m.Placeholder })));

// ─── Loading fallback shared by all lazy routes ───────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full py-24">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
        <p className="text-slate-400 text-sm">Loading module...</p>
      </div>
    </div>
  );
}

// ─── Named placeholder pages (avoids creating dozens of files) ───────────────
const PlaceholderRoute = ({ title }: { title: string }) => (
  <Suspense fallback={<PageLoader />}>
    <Placeholder title={title} />
  </Suspense>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Core modules ── */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/sync" element={<RepoSync />} />
              <Route path="/matrix" element={<Matrix />} />
              <Route path="/contracts" element={<Contracts />} />

              {/* ── Modules under development ── */}
              <Route path="/explorer" element={<PlaceholderRoute title="Data Explorer" />} />
              <Route path="/economics" element={<PlaceholderRoute title="Economics Simulator" />} />
              <Route path="/layers" element={<PlaceholderRoute title="7-Layer Visualizer" />} />
              <Route path="/rwa" element={<PlaceholderRoute title="Real World Assets" />} />
              <Route path="/subscriptions" element={<PlaceholderRoute title="Subscriptions" />} />

              {/* ── Catch-all redirect ── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
