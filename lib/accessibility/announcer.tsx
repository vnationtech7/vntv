"use client";

import { useEffect, useState } from "react";

/**
 * Screen reader announcer for dynamic content updates
 * 
 * Usage:
 * import { announce } from "@/lib/accessibility/announcer";
 * announce("Form submitted successfully", "polite");
 */

let announceQueue: Array<{ message: string; priority: "polite" | "assertive" }> = [];
let listeners: Array<(messages: typeof announceQueue) => void> = [];

export function announce(message: string, priority: "polite" | "assertive" = "polite") {
  announceQueue = [...announceQueue, { message, priority }];
  listeners.forEach((listener) => listener(announceQueue));

  // Clear after announcement
  setTimeout(() => {
    announceQueue = announceQueue.filter((item) => item.message !== message);
    listeners.forEach((listener) => listener(announceQueue));
  }, 1000);
}

/**
 * LiveRegion component - Place once in root layout
 */
export function LiveRegion() {
  const [messages, setMessages] = useState(announceQueue);

  useEffect(() => {
    const listener = (newMessages: typeof announceQueue) => {
      setMessages(newMessages);
    };

    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <>
      {/* Polite announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {messages
          .filter((m) => m.priority === "polite")
          .map((m, i) => (
            <div key={i}>{m.message}</div>
          ))}
      </div>

      {/* Assertive announcements */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {messages
          .filter((m) => m.priority === "assertive")
          .map((m, i) => (
            <div key={i}>{m.message}</div>
          ))}
      </div>
    </>
  );
}
