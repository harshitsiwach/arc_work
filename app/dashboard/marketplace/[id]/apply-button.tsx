"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function GigApplyButton({ gigId }: { gigId?: string }) {
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [step, setStep] = useState<"idle" | "connecting" | "signing" | "broadcasting" | "done">("idle");

  const handleApply = async () => {
    setStep("connecting");
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setStep("signing");
    await new Promise(resolve => setTimeout(resolve, 500));
    setStep("broadcasting");
    await new Promise(resolve => setTimeout(resolve, 800));
    setStep("done");
    setLoading(false);
    setApplied(true);
    toast.success("Application submitted!", {
      description: "Your profile has been sent to the gig poster for review.",
    });
  };

  if (applied) {
    return (
      <div className="erc-apply-success">
        <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: "var(--color-success)" }} />
        <div className="text-left">
          <p className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>Applied</p>
          <p className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>Waiting for gig poster to review</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        className="w-full btn-primary"
        onClick={handleApply}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {step === "connecting" && "Connecting..."}
            {step === "signing" && "Signing..."}
            {step === "broadcasting" && "Broadcasting..."}
          </>
        ) : (
          <>
            <Zap className="h-4 w-4" />
            Apply for this Gig
          </>
        )}
      </Button>

      {loading && (
        <div className="erc-apply-progress">
          {["connect", "sign", "broadcast"].map((s, i) => {
            const steps = ["connecting", "signing", "broadcasting"];
            const currentIdx = steps.indexOf(step);
            const isActive = i === currentIdx;
            const isDone = i < currentIdx;
            return (
              <div key={s} className="flex items-center gap-1.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    isDone ? "bg-[var(--color-success)]" :
                    isActive ? "bg-[var(--color-accent)] animate-pulse-soft" :
                    "bg-[var(--color-bd)]"
                  }`}
                />
                <span className="text-[9px] font-mono" style={{ color: "var(--color-fg-muted)" }}>{s}</span>
              </div>
            );
          })}
        </div>
      )}

      {!loading && (
        <p className="text-center text-[10px]" style={{ color: "var(--color-fg-muted)" }}>
          1 transaction to apply — gasless on Arc
        </p>
      )}
    </div>
  );
}
