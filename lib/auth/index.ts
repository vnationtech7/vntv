/**
 * Authentication Utilities
 * 
 * Server-side helpers for authentication:
 * - getUser(): Get current user in server components
 * - getSession(): Get current session in server components
 * - requireUser(): Require authentication, throws error if not authenticated
 */

export { getUser, getSession, requireUser } from "./get-user";
