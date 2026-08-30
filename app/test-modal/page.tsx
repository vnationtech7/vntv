"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  Button,
} from "@/components/ui";

export default function TestModalPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Modal Test Page</h1>
        <p className="text-text-secondary">Click the button to test if the modal opens</p>
        
        <Button onClick={() => {
          console.log("Button clicked, setting isOpen to true");
          setIsOpen(true);
        }}>
          Open Test Modal
        </Button>

        <div className="mt-4 p-4 bg-background-panel rounded-lg text-left">
          <p className="text-sm">Modal State: <strong>{isOpen ? "OPEN" : "CLOSED"}</strong></p>
        </div>

        <Dialog open={isOpen} onOpenChange={(open) => {
          console.log("Dialog onOpenChange called with:", open);
          setIsOpen(open);
        }}>
          <DialogContent size="sm">
            <DialogHeader>
              <DialogTitle>Test Modal</DialogTitle>
              <DialogDescription>
                If you can see this, the modal is working!
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              <div className="space-y-4">
                <p>This is a test modal to verify that the Dialog component is rendering correctly.</p>
                
                <Button 
                  onClick={() => {
                    console.log("Close button clicked");
                    setIsOpen(false);
                  }}
                  fullWidth
                >
                  Close Modal
                </Button>
              </div>
            </DialogBody>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
