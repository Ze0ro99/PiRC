import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { 
  CreditCard, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  Loader2, 
  Terminal, 
  Sparkles, 
  Cpu, 
  TrendingUp, 
  Coffee,
  HelpCircle
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  amount: number;
  memo: string;
  metadata: Record<string, any>;
  icon: any;
  description: string;
}

const PREDEFINED_PRODUCTS: Product[] = [
  {
    id: "pirc_premium",
    name: "PiRC Sovereign Premium Access",
    amount: 1.0,
    memo: "Unlocks premium cross-repository synchronization tools and smart contract vaults.",
    metadata: { productId: "pirc_premium", duration: "annual" },
    icon: Sparkles,
    description: "Full year of premium sync features, contract studio integration, and 7-layer priority visualizer."
  },
  {
    id: "compiler_boost",
    name: "Smart Contract Compilation Boost",
    amount: 0.5,
    memo: "High-priority server-side compilation credits for smart contract studio.",
    metadata: { productId: "compiler_boost", credits: 50 },
    icon: Cpu,
    description: "Adds 50 high-speed priority compiler runs to the Sovereign Smart Contract Studio."
  },
  {
    id: "node_boost",
    name: "Omni Node Power Level-Up",
    amount: 0.2,
    memo: "Increases sovereign matrix node limits from standard to advanced levels.",
    metadata: { productId: "node_boost", power: "advanced" },
    icon: TrendingUp,
    description: "Upgrades your local registry node allocation capacity with optimal network replication."
  },
  {
    id: "dev_tip",
    name: "Sovereign Dev Support Tip",
    amount: 0.1,
    memo: "A direct donation to help maintain and scale the PiRC sovereign architecture.",
    metadata: { productId: "dev_tip", donor: "pirc_sovereign_builder" },
    icon: Coffee,
    description: "Direct support for the core developers of the PiRC Omni Sovereign Architecture."
  }
];

export function Subscriptions() {
  const { user, isPiReady } = useAuth();
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(PREDEFINED_PRODUCTS[0]);
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  
  // Custom Product States
  const [customName, setCustomName] = useState("Custom Development Powerup");
  const [customAmount, setCustomAmount] = useState(0.01);
  const [customMemo, setCustomMemo] = useState("Sovereign Sandbox Test Payment");
  const [customMetadata, setCustomMetadata] = useState('{"test": true, "type": "sandbox"}');

  // Logs / Status
  const [logs, setLogs] = useState<string[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "initializing" | "approved" | "completed" | "error">("idle");
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [currentTxid, setCurrentTxid] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    // Check if Pi API Key is configured on backend
    fetch("/api/payments/config")
      .then((res) => res.json())
      .then((data) => {
        setIsConfigured(data.configured);
      })
      .catch((err) => {
        console.error("Failed to fetch payments configuration status:", err);
        setIsConfigured(false);
      });
  }, []);

  const handleCreatePayment = async () => {
    setErrorMessage(null);
    setPaymentStatus("initializing");
    setLogs([]);
    addLog("Initiating Pi payment request...");

    if (!isPiReady || typeof window.Pi === "undefined") {
      const msg = "Pi SDK is not fully initialized. Ensure you are running inside the Pi Browser.";
      setErrorMessage(msg);
      setPaymentStatus("error");
      addLog(`ERROR: ${msg}`);
      return;
    }

    // Determine target product details
    let name = "";
    let amount = 0;
    let memo = "";
    let metadata: Record<string, any> = {};

    if (isCustomProduct) {
      name = customName;
      amount = customAmount;
      memo = customMemo;
      try {
        metadata = JSON.parse(customMetadata);
      } catch (e) {
        const msg = "Invalid custom metadata JSON. Must be valid key-value pairs.";
        setErrorMessage(msg);
        setPaymentStatus("error");
        addLog(`ERROR: ${msg}`);
        return;
      }
    } else if (selectedProduct) {
      name = selectedProduct.name;
      amount = selectedProduct.amount;
      memo = selectedProduct.memo;
      metadata = selectedProduct.metadata;
    } else {
      const msg = "Please select or define a product first.";
      setErrorMessage(msg);
      setPaymentStatus("error");
      addLog(`ERROR: ${msg}`);
      return;
    }

    addLog(`Preparing payment of ${amount} Pi for: "${name}"`);
    addLog(`Memo: "${memo}"`);
    addLog(`Metadata: ${JSON.stringify(metadata)}`);

    try {
      // Create the payment
      window.Pi.createPayment({
        amount: amount,
        memo: memo,
        metadata: {
          ...metadata,
          productName: name,
          buyerUsername: user?.username || "anonymous",
        }
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          addLog(`\n--- STEP 1: onReadyForServerApproval ---`);
          addLog(`Payment ID generated: ${paymentId}`);
          setCurrentPaymentId(paymentId);
          addLog(`Dispatching paymentId to server approval endpoint...`);

          try {
            const res = await fetch("/api/payments/approve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId }),
            });

            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.error || "Server rejected approval");
            }

            const data = await res.json();
            addLog(`Server responded: Payment approved successfully!`);
            addLog(`Server payload: ${JSON.stringify(data.data)}`);
            setPaymentStatus("approved");
          } catch (approvalErr: any) {
            addLog(`ERROR during server approval: ${approvalErr.message}`);
            setPaymentStatus("error");
            setErrorMessage(approvalErr.message);
            throw approvalErr; // Halt Pi SDK payment flow
          }
        },

        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          addLog(`\n--- STEP 2: onReadyForServerCompletion ---`);
          addLog(`User signed transaction successfully.`);
          addLog(`Blockchain TXID: ${txid}`);
          setCurrentTxid(txid);
          addLog(`Dispatching paymentId and txid to server completion endpoint...`);

          try {
            const res = await fetch("/api/payments/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, txid }),
            });

            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.error || "Server rejected completion");
            }

            const data = await res.json();
            addLog(`Server responded: Payment completed and settled successfully!`);
            addLog(`Final Settlement details: ${JSON.stringify(data.data)}`);
            setPaymentStatus("completed");
          } catch (completionErr: any) {
            addLog(`ERROR during server completion: ${completionErr.message}`);
            setPaymentStatus("error");
            setErrorMessage(completionErr.message);
            throw completionErr; // Halt Pi SDK
          }
        },

        onCancel: (paymentId: string) => {
          addLog(`\nPayment cancelled by user. (ID: ${paymentId})`);
          setPaymentStatus("idle");
        },

        onError: (error: any, payment: any) => {
          addLog(`\nERROR: Payment handshake error occurred.`);
          addLog(`Reason: ${error.message || JSON.stringify(error)}`);
          if (payment) {
            addLog(`Payment State at Error: ${JSON.stringify(payment)}`);
          }
          setPaymentStatus("error");
          setErrorMessage(error.message || "An unexpected payment error occurred.");
        }
      });
    } catch (err: any) {
      console.error(err);
      addLog(`Unexpected creation exception: ${err.message}`);
      setPaymentStatus("error");
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="text-violet-500 h-8 w-8" /> Pi RC Payments Studio
          </h2>
          <p className="text-slate-400 mt-1">
            Configure, validate, and test server-to-server Pi Network payments in real-time.
          </p>
        </div>
        
        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-2">
          {isConfigured === false && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-950/40 border border-amber-900/50 rounded-xl text-xs text-amber-400 font-mono shadow-inner">
              <AlertTriangle className="h-4 w-4 animate-pulse flex-shrink-0" />
              <span>Warning: PI_NETWORK_API_KEY environment variable is not configured. Payments will fall back to simulated developer sandbox responses. Please configure PI_NETWORK_API_KEY for mainnet/testnet server validation.</span>
            </div>
          )}
          {isConfigured === true && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-xs text-emerald-400 font-mono shadow-inner">
              <ShieldCheck className="h-4 w-4 flex-shrink-0" />
              <span>Sovereign Server Key Loaded</span>
            </div>
          )}
          {isPiReady ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-950/40 border border-indigo-900/50 rounded-xl text-xs text-indigo-400 font-mono shadow-inner">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>Pi Browser Connection Verified</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-950/40 border border-rose-900/50 rounded-xl text-xs text-rose-400 font-mono shadow-inner">
              <HelpCircle className="h-4 w-4 flex-shrink-0 animate-bounce" />
              <span>Demo Mode / Regular Browser</span>
            </div>
          )}
        </div>
      </div>

      {/* Main configuration grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Product Selection & Configuration */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                1. Select Payment Product
              </h3>
              <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10 text-xs">
                <button
                  onClick={() => setIsCustomProduct(false)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${!isCustomProduct ? "bg-violet-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                >
                  Standard Products
                </button>
                <button
                  onClick={() => setIsCustomProduct(true)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${isCustomProduct ? "bg-violet-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                >
                  Custom Tester
                </button>
              </div>
            </div>

            {/* Product selection views */}
            {!isCustomProduct ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PREDEFINED_PRODUCTS.map((prod) => {
                  const ProdIcon = prod.icon;
                  const isSelected = selectedProduct?.id === prod.id;
                  return (
                    <button
                      key={prod.id}
                      onClick={() => setSelectedProduct(prod)}
                      className={`text-left p-5 rounded-xl border transition-all flex flex-col justify-between h-48 group hover:scale-[1.02] ${
                        isSelected 
                          ? "bg-violet-600/10 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.15)] text-white" 
                          : "bg-white/[0.01] border-white/5 text-slate-300 hover:border-white/10 hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className={`p-2 rounded-lg ${isSelected ? "bg-violet-600 text-white" : "bg-white/5 text-violet-400 group-hover:text-violet-300"}`}>
                            <ProdIcon className="h-5 w-5" />
                          </div>
                          <span className="text-xl font-bold font-mono text-violet-400">{prod.amount} π</span>
                        </div>
                        <h4 className="font-bold text-sm leading-tight text-white group-hover:text-violet-300 transition-colors mt-2">{prod.name}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">{prod.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all font-medium"
                    placeholder="e.g. Sovereign Pro Vault"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount (Pi)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all font-mono"
                      placeholder="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Memo (User Visible)</label>
                    <input
                      type="text"
                      value={customMemo}
                      onChange={(e) => setCustomMemo(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
                      placeholder="Reason for payment"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Backend Metadata (JSON)</label>
                  <textarea
                    value={customMetadata}
                    onChange={(e) => setCustomMetadata(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all font-mono h-24"
                    placeholder='{"customId": "xyz_123"}'
                  />
                </div>
              </div>
            )}

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                2. Review & Transact
              </h3>
              <div className="p-4 bg-[#111111] border border-white/5 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Merchant Recipient:</span>
                  <span className="text-white font-mono font-bold">PiRC Sovereign Hub</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Payment Product:</span>
                  <span className="text-violet-400 font-bold max-w-xs text-right truncate">
                    {isCustomProduct ? customName : selectedProduct?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-white/5 pt-3">
                  <span className="text-slate-400 font-bold">Total Request Amount:</span>
                  <span className="text-emerald-400 font-extrabold font-mono text-xl">
                    {isCustomProduct ? customAmount : selectedProduct?.amount} π
                  </span>
                </div>
              </div>

              <button
                onClick={handleCreatePayment}
                disabled={paymentStatus === "initializing" || paymentStatus === "approved"}
                className={`w-full py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] ${
                  paymentStatus === "initializing" || paymentStatus === "approved"
                    ? "bg-violet-600/50 text-white/50 cursor-not-allowed"
                    : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-950/20"
                }`}
              >
                {paymentStatus === "initializing" || paymentStatus === "approved" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing Handshake...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    <span>Pay with Pi Wallet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Console Logs & Verification */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-6 shadow-2xl h-full flex flex-col justify-between min-h-[500px]">
            <div className="space-y-4 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
                <Terminal className="text-violet-500 h-5 w-5" /> Live Handshake Console
              </h3>

              {/* Console log display */}
              <div className="flex-1 min-h-[300px] max-h-[420px] overflow-y-auto bg-black border border-white/5 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2.5 shadow-inner">
                {logs.length === 0 ? (
                  <div className="text-slate-500 flex flex-col items-center justify-center h-full py-20 text-center gap-2">
                    <Activity className="h-8 w-8 text-slate-600 animate-pulse" />
                    <p>Ready to trace transaction signatures.</p>
                    <p className="text-[10px] text-slate-600">Start a payment to view logs.</p>
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap leading-relaxed border-l-2 border-violet-500/20 pl-3">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment state summary */}
            <div className="mt-6 border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transaction Summary</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-1">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Payment ID</div>
                  <div className="text-xs font-mono font-semibold text-white truncate" title={currentPaymentId || "None"}>
                    {currentPaymentId || "Not generated yet"}
                  </div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-1">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Tx Signature ID</div>
                  <div className="text-xs font-mono font-semibold text-white truncate" title={currentTxid || "None"}>
                    {currentTxid || "Not submitted yet"}
                  </div>
                </div>
              </div>

              {paymentStatus === "completed" && (
                <div className="flex items-center gap-3 p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-emerald-400">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 animate-bounce" />
                  <div className="text-xs font-semibold">
                    Payment verified, settled, and completed successfully! Your smart contract allocation has been updated.
                  </div>
                </div>
              )}

              {paymentStatus === "error" && errorMessage && (
                <div className="flex items-center gap-3 p-4 bg-rose-950/30 border border-rose-900/50 rounded-xl text-rose-400">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <div className="text-xs font-semibold">
                    {errorMessage}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
