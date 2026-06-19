"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Loader2, Code, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EndpointData {
  url: string;
  method: string;
  description: string;
  price: string;
}

interface EndpointAccordionProps {
  endpoint: EndpointData;
  isPaid: boolean;
  isPaying: boolean;
  paymentTxHash: string;
  isConnected: boolean;
  chainId: number | null;
  targetChainId: number;
  validatorAddress: string;
  isBaseService: boolean;
  onSelect: () => void;
  onPay: () => void;
  onConnect: () => void;
  onSwitchChain: () => void;
  playgroundInput: string;
  onPlaygroundInputChange: (val: string) => void;
  runningApi: boolean;
  apiResponse: any;
  onRunApi: () => void;
}

export function EndpointAccordion({
  endpoint,
  isPaid,
  isPaying,
  paymentTxHash,
  isConnected,
  chainId,
  targetChainId,
  validatorAddress,
  isBaseService,
  onSelect,
  onPay,
  onConnect,
  onSwitchChain,
  playgroundInput,
  onPlaygroundInputChange,
  runningApi,
  apiResponse,
  onRunApi,
}: EndpointAccordionProps) {
  const [expanded, setExpanded] = useState(false);

  const methodColors: Record<string, { base: string; badge: string }> = {
    GET: { base: "border-emerald-500/30 hover:border-emerald-500/50", badge: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25" },
    POST: { base: "border-blue-500/30 hover:border-blue-500/50", badge: "text-blue-400 bg-blue-400/10 border-blue-400/25" },
    PUT: { base: "border-amber-500/30 hover:border-amber-500/50", badge: "text-amber-400 bg-amber-400/10 border-amber-400/25" },
    PATCH: { base: "border-violet-500/30 hover:border-violet-500/50", badge: "text-violet-400 bg-violet-400/10 border-violet-400/25" },
    DELETE: { base: "border-red-500/30 hover:border-red-500/50", badge: "text-red-400 bg-red-400/10 border-red-400/25" },
  };

  const mc = methodColors[endpoint.method] || methodColors.POST;
  const price = parseFloat(endpoint.price) || 0.001;

  const endpointName = endpoint.url.split("/").pop() || endpoint.url;

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-300 overflow-hidden group",
        expanded
          ? "border-lime-400/20 bg-black/40"
          : cn("bg-black/20", mc.base),
        isPaid && "border-lime-400/30"
      )}
    >
      <button
        onClick={() => {
          setExpanded(!expanded);
          onSelect();
        }}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <span
          className={cn(
            "px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border tracking-wide",
            mc.badge
          )}
        >
          {endpoint.method}
        </span>

        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-white/80 group-hover:text-white/90 truncate block transition-colors">
            {endpoint.description || endpointName}
          </span>
          <span className="text-[11px] text-white/25 font-mono truncate block mt-0.5">
            {endpoint.url}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs font-medium text-lime-400/80">
            {price < 0.01 ? `$${price.toFixed(4)}` : `$${price.toFixed(2)}`}
          </span>
          {isPaid && (
            <CheckCircle className="h-4 w-4 text-lime-400" />
          )}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-white/20" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
              <p className="text-xs text-white/50 leading-relaxed">
                {endpoint.description || `Access the ${endpoint.url} endpoint.`}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider mb-1">Method</p>
                  <span className={cn("text-xs font-mono font-semibold px-2 py-0.5 rounded border", mc.badge)}>
                    {endpoint.method}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider mb-1">Price</p>
                  <p className="text-xs font-medium text-lime-400/80">
                    {price < 0.01 ? `$${price.toFixed(4)}` : `$${price.toFixed(2)}`} USDC
                  </p>
                </div>
              </div>

              {!isPaid ? (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-400/5 border border-amber-400/10">
                    <Zap className="h-3.5 w-3.5 text-amber-400/60 flex-shrink-0" />
                    <span className="text-xs font-medium text-amber-400/70">Authorize Payment</span>
                  </div>

                  <div className="flex gap-2">
                    {!isConnected ? (
                      <Button onClick={onConnect} className="bg-lime-400 hover:bg-lime-400/90 text-black font-medium text-xs h-9 px-5 rounded-xl">
                        Connect Wallet
                      </Button>
                    ) : chainId !== targetChainId ? (
                      <Button onClick={onSwitchChain} className="bg-lime-400 hover:bg-lime-400/90 text-black font-medium text-xs h-9 px-5 rounded-xl">
                        Switch to {isBaseService ? "Base" : "Arc Testnet"}
                      </Button>
                    ) : (
                      <Button
                        disabled={isPaying || (!isBaseService && !validatorAddress)}
                        onClick={onPay}
                        className="bg-lime-400 hover:bg-lime-400/90 text-black font-semibold text-xs h-9 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-lime-400/20"
                      >
                        {isPaying ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Zap className="h-3.5 w-3.5" />
                            Pay {price < 0.01 ? `$${price.toFixed(4)}` : `$${price.toFixed(2)}`} USDC
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {!validatorAddress && !isBaseService && (
                    <p className="text-[10px] text-red-400 font-medium">
                      Validator contract not configured.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-lime-400/5 border border-lime-400/10">
                    <CheckCircle className="h-4 w-4 text-lime-400 flex-shrink-0" />
                    <div className="text-xs text-lime-400/80">
                      <span className="font-medium text-lime-400">Payment verified</span>
                      <code className="block text-[10px] font-mono text-lime-400/50 mt-0.5 truncate">
                        Tx: {paymentTxHash.slice(0, 10)}...{paymentTxHash.slice(-6)}
                      </code>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-white/40">Your Prompt</label>
                    <textarea
                      value={playgroundInput}
                      onChange={(e) => onPlaygroundInputChange(e.target.value)}
                      placeholder="Ask anything..."
                      className="w-full h-24 p-3 rounded-xl border border-white/10 bg-black/30 text-xs text-white/60 placeholder:text-white/20 resize-none focus:outline-none focus:border-lime-400/30 transition-colors duration-200"
                    />
                  </div>

                  <Button
                    disabled={runningApi}
                    onClick={onRunApi}
                    className="w-full bg-lime-400 hover:bg-lime-400/90 text-black font-semibold h-10 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20"
                  >
                    {runningApi ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Code className="h-4 w-4" />
                        Execute Endpoint
                      </>
                    )}
                  </Button>

                  {apiResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <p className="text-xs font-medium text-white/40">Response</p>
                      <pre className="p-3 rounded-2xl border border-white/5 bg-black/60 text-[11px] font-mono text-white/50 overflow-auto max-h-48">
                        {JSON.stringify(apiResponse, null, 2)}
                      </pre>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
