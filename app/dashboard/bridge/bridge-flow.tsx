/**
 * Arc Work — Bridge Flow Visualization
 * Shows source → bridge → destination flow
 */
"use client";

import { motion } from "framer-motion";
import { Zap, CheckCircle2 } from "lucide-react";
import { getChainIcon } from "./icons";

interface BridgeFlowProps {
  status: "idle" | "pending" | "confirming" | "completed" | "failed";
  sourceChain: string;
  sourceChainId: number;
}

export function BridgeFlow({ status, sourceChain, sourceChainId }: BridgeFlowProps) {
  const isActive = status === "pending" || status === "confirming";
  const isComplete = status === "completed";

  const steps = [
    { label: sourceChain, short: "Source", icon: getChainIcon(sourceChainId) },
    { label: "CCTP Bridge", short: "Bridge", icon: <Zap className="w-5 h-5 text-[var(--color-accent)]" /> },
    { label: "Arc Testnet", short: "Arc", icon: getChainIcon(5042002) },
  ];

  return (
    <div className="flex items-center justify-between px-2 py-4">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-2 w-full relative">
            <motion.div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-shadow duration-300 ${
                isComplete ? "shadow-[0_0_15px_rgba(16,185,129,0.2)]" : isActive && i <= 1 ? "shadow-[0_0_15px_var(--color-accent-soft)]" : ""
              }`}
              style={{
                backgroundColor: isComplete
                  ? "rgba(16, 185, 129, 0.1)"
                  : isActive && i <= 1
                  ? "var(--color-accent-soft)"
                  : "var(--color-bg-inset)",
                border: `1px solid ${isComplete ? "rgba(16, 185, 129, 0.2)" : isActive && i <= 1 ? "var(--color-accent)" : "var(--color-bd)"}`
              }}
              animate={{
                scale: isActive && i === 1 ? [1, 1.05, 1] : 1,
              }}
              transition={{ duration: 1.5, repeat: isActive && i === 1 ? Infinity : 0 }}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {isComplete ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                ) : (
                  step.icon
                )}
              </div>
            </motion.div>
            <span
              className="text-[11px] font-semibold text-center uppercase tracking-wider"
              style={{
                color: isComplete
                  ? "#10b981"
                  : isActive && i <= 1
                  ? "var(--color-accent)"
                  : "var(--color-fg-muted)",
              }}
            >
              {step.short}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 flex items-center justify-center mx-2 relative h-px">
              <motion.div
                className="h-full flex-1 rounded-full absolute inset-0"
                style={{
                  backgroundColor: isComplete
                    ? "rgba(16, 185, 129, 0.5)"
                    : isActive && i === 0
                    ? "var(--color-accent)"
                    : "var(--color-bd)",
                }}
              />
              {isActive && i === 0 && (
                <motion.div
                  className="absolute z-10 w-8 h-px bg-gradient-to-r from-transparent via-white to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
