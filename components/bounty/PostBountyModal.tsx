"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle2, DollarSign, Calendar, Users, Bot, Layers } from "lucide-react";
import { toast } from "sonner";
import { useCreateBounty } from "@/hooks/useBounty";

interface PostBountyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type WorkerType = "HUMAN" | "AGENT" | "BOTH";

const WORKER_OPTIONS: { value: WorkerType; label: string; icon: typeof Users }[] = [
  { value: "HUMAN", label: "Human", icon: Users },
  { value: "AGENT", label: "AI Agent", icon: Bot },
  { value: "BOTH", label: "Both", icon: Layers },
];

export function PostBountyModal({ open, onOpenChange }: PostBountyModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");
  const [deadline, setDeadline] = useState("");
  const [workerType, setWorkerType] = useState<WorkerType>("BOTH");
  const { createBounty, isLoading, error } = useCreateBounty();

  const resetForm = () => {
    setStep(1);
    setTitle("");
    setDescription("");
    setReward("");
    setDeadline("");
    setWorkerType("BOTH");
  };

  const handleClose = (value: boolean) => {
    if (!isLoading) {
      onOpenChange(value);
      if (!value) resetForm();
    }
  };

  const canContinue = title.trim() && description.trim() && reward && parseFloat(reward) >= 1 && deadline && new Date(deadline) > new Date();

  const handleSubmit = async () => {
    try {
      await createBounty({
        title: title.trim(),
        description: description.trim(),
        rewardUsdc: reward,
        deadline: new Date(deadline),
        workerType,
      });
      toast.success("Bounty posted!");
      handleClose(false);
    } catch {
      // error state is in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[520px]"
        style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: "var(--color-fg)" }}>
            {step === 1 ? "Post a Bounty" : "Confirm & Fund"}
          </DialogTitle>
          <DialogDescription style={{ color: "var(--color-fg-muted)" }}>
            {step === 1
              ? "Describe the task and set your reward."
              : "Review your bounty details before locking USDC."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label style={{ color: "var(--color-fg)" }}>Title</Label>
              <Input
                placeholder="e.g. Create a landing page mockup"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
              />
            </div>

            <div className="space-y-1.5">
              <Label style={{ color: "var(--color-fg)" }}>Description</Label>
              <textarea
                placeholder="Describe requirements in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg px-3 py-2 text-sm resize-none"
                style={{ backgroundColor: "var(--color-bg-inset)", border: "1px solid", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5" style={{ color: "var(--color-fg)" }}>
                  <DollarSign size={13} /> USDC Reward
                </Label>
                <Input
                  type="number"
                  min={1}
                  step="0.01"
                  placeholder="50.00"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5" style={{ color: "var(--color-fg)" }}>
                  <Calendar size={13} /> Deadline
                </Label>
                <Input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label style={{ color: "var(--color-fg)" }}>Who can complete this?</Label>
              <div className="grid grid-cols-3 gap-2">
                {WORKER_OPTIONS.map((opt) => {
                  const active = workerType === opt.value;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setWorkerType(opt.value)}
                      className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: active
                          ? "color-mix(in srgb, var(--color-accent) 16%, transparent)"
                          : "var(--color-bg-inset)",
                        border: "1px solid",
                        borderColor: active ? "var(--color-accent)" : "var(--color-bd)",
                        color: active ? "var(--color-accent)" : "var(--color-fg-muted)",
                      }}
                    >
                      <Icon size={13} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              className="w-full"
              disabled={!canContinue}
              onClick={() => setStep(2)}
              style={{ backgroundColor: "var(--color-accent)", color: "white" }}
            >
              Continue
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Summary */}
            <div
              className="rounded-lg p-4 space-y-2.5 text-sm"
              style={{ backgroundColor: "var(--color-bg-inset)", border: "1px solid", borderColor: "var(--color-bd)" }}
            >
              <div className="flex justify-between">
                <span style={{ color: "var(--color-fg-muted)" }}>Title</span>
                <span className="font-medium text-right max-w-[60%] truncate" style={{ color: "var(--color-fg)" }}>{title}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-fg-muted)" }}>Reward</span>
                <span className="font-bold" style={{ color: "var(--color-accent)" }}>{reward} USDC</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-fg-muted)" }}>Deadline</span>
                <span style={{ color: "var(--color-fg)" }}>{new Date(deadline).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-fg-muted)" }}>Worker Type</span>
                <span style={{ color: "var(--color-fg)" }}>{workerType}</span>
              </div>
            </div>

            {/* Warning */}
            <div
              className="flex items-start gap-2 rounded-lg p-3 text-xs"
              style={{ backgroundColor: "color-mix(in srgb, oklch(0.75 0.15 85) 10%, transparent)", color: "oklch(0.75 0.15 85)" }}
            >
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>Funds will be locked until a submission is approved or deadline passes.</span>
            </div>

            {error && (
              <div
                className="flex items-start gap-2 rounded-lg p-3 text-xs"
                style={{ backgroundColor: "color-mix(in srgb, oklch(0.65 0.22 25) 10%, transparent)", color: "oklch(0.65 0.22 25)" }}
              >
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
                disabled={isLoading}
                style={{ borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={isLoading}
                onClick={handleSubmit}
                style={{ backgroundColor: "var(--color-accent)", color: "white" }}
              >
                {isLoading ? (
                  <><Loader2 size={14} className="animate-spin mr-1.5" /> Processing...</>
                ) : (
                  <><CheckCircle2 size={14} className="mr-1.5" /> Approve USDC &amp; Post</>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
