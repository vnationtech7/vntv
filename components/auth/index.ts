/**
 * Authentication Components
 * 
 * Provides login, signup, and password reset functionality.
 * 
 * Usage:
 * 1. Wrap your app with AuthProvider
 * 2. Use the useAuth hook to open modals
 * 
 * Example:
 * ```tsx
 * import { useAuth } from "@/components/auth";
 * 
 * function MyComponent() {
 *   const { openLogin } = useAuth();
 *   return <Button onClick={openLogin}>Sign In</Button>;
 * }
 * ```
 */

export { AuthProvider, useAuth } from "./auth-provider";
export { LoginModal } from "./login-modal";
export { SignupModal } from "./signup-modal";
export { ResetPasswordModal } from "./reset-password-modal";
