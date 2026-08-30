"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { LoginModal } from "./login-modal";
import { SignupModal } from "./signup-modal";
import { ResetPasswordModal } from "./reset-password-modal";

type AuthModal = "login" | "signup" | "reset" | null;

interface AuthContextValue {
  openLogin: () => void;
  openSignup: () => void;
  openReset: () => void;
  closeAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [activeModal, setActiveModal] = useState<AuthModal>(null);

  const value: AuthContextValue = {
    openLogin: () => setActiveModal("login"),
    openSignup: () => setActiveModal("signup"),
    openReset: () => setActiveModal("reset"),
    closeAuth: () => setActiveModal(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}

      {/* Login Modal */}
      <LoginModal
        isOpen={activeModal === "login"}
        onClose={(open) => !open && setActiveModal(null)}
        onSwitchToSignup={() => setActiveModal("signup")}
        onSwitchToReset={() => setActiveModal("reset")}
      />

      {/* Signup Modal */}
      <SignupModal
        isOpen={activeModal === "signup"}
        onClose={(open) => !open && setActiveModal(null)}
        onSwitchToLogin={() => setActiveModal("login")}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        open={activeModal === "reset"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        onSwitchToLogin={() => setActiveModal("login")}
      />
    </AuthContext.Provider>
  );
}
