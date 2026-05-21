/**
 * Arc Work — Bridge Flow Visualization
 * Shows source → bridge → destination flow
 */
"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, CheckCircle2 } from "lucide-react";

interface BridgeFlowProps {
  status: "idle" | "pending" | "confirming" | "completed" | "failed";
  sourceChain: string;
}

export function BridgeFlow({ status, sourceChain }: BridgeFlowProps) {
  const isActive = status === "pending" || status === "confirming";
  const isComplete = status === "completed";

  const steps = [
    { label: sourceChain, short: "Source", icon: "🔗" },
    { label: "CCTP Bridge", short: "Bridge", icon: "🌉" },
    { label: "Arc Testnet", short: "Arc", icon: "⚡" },
  ];

  return (
    <div className="flex items-center justify-between px-2 py-3">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1.5 w-full">
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              animate={{
                backgroundColor: isComplete
                  ? "oklch(0.60 0.15 150 / 0.12)"
                  : isActive && i <= 1
                  ? "var(--color-accent-soft)"
                  : "var(--color-bg-inset)",
                scale: isActive && i === 1 ? 1.1 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {isComplete ? (
                <CheckCircle2 className="h-4 w-4" style={{ color: "oklch(0.60 0.15 150)" }} />
              ) : (
                step.icon
              )}
            </motion.div>
            <span
              className="text-[10px] font-medium text-center"
              style={{
                color: isComplete
                  ? "oklch(0.60 0.15 150)"
                  : isActive && i <= 1
                  ? "var(--color-accent)"
                  : "var(--color-fg-muted)",
              }}
            >
              {step.short}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 flex items-center justify-center mx-1">
              <motion.div
                className="h-px flex-1"
                animate={{
                  backgroundColor: isComplete
                    ? "oklch(0.60 0.15 150)"
                    : isActive && i === 0
                    ? "var(--color-accent)"
                    : "var(--color-bd)",
                }}
                transition={{ duration: 0.3 }}
              />
              {isActive && i === 0 && (
                <motion.div
                  className="absolute"
                  animate={{ x: [0, 20, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Zap className="h-3 w-3" style={{ color: "var(--color-accent)" }} />
                </motion.div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
