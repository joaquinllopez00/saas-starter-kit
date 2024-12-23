import { useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export function OnboardingCompleteDialog({ open }: { open: boolean }) {
  const navigate = useNavigate();
  const onClose = () => {
    navigate("/dashboard");
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(openState: boolean) => {
        if (!openState) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Onboarding complete!</DialogTitle>
          <DialogDescription>
            You're all set up and ready to go.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>Go to dashboard</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
