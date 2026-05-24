"use client";

import { useEffect, useState, type FunctionComponent } from "react";
import Confetti from "react-confetti";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  workAccepted: boolean
  handleCongratulate: () => void
}

export const ValidationSucceededDialog: FunctionComponent<Props> = props => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(props.workAccepted);

    if (!props.workAccepted) return;

    setTimeout(() => setShowConfetti(false), 5000);
  }, [props.workAccepted]);

  return (
    <>
      {showConfetti && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 9999, pointerEvents: "none" }}>
          <Confetti width={window.innerWidth} height={window.innerHeight} />
        </div>
      )}
      <AlertDialog open={props.workAccepted}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Work Approved! {String.fromCodePoint(0x1F60A)}</AlertDialogTitle>
            <AlertDialogDescription>
              Congratulations, your work was accepted!
            </AlertDialogDescription>
            <h3>Your payment is on the way. {String.fromCodePoint(0x1F911)}</h3>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => props.handleCongratulate()}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}