// lib/security.ts - Simple regex-based security
import { z } from "zod";

// Security regex patterns
const DANGEROUS_PATTERNS = [
  /<script/i, // Script tags
  /javascript:/i, // JS protocol
  /on\w+\s*=/i, // Event handlers (onclick, onload, etc)
  /\$\{/, // Template literals ${...}
  /<%/, // Server templates <%...%>
  /\{\{/, // Template engines {{...}}
  /<\/?\w+/i, // HTML tags
  /union.*select/i, // SQL injection
  /drop.*table/i, // SQL injection
  /insert.*into/i, // SQL injection
  /delete.*from/i, // SQL injection
  /update.*set/i, // SQL injection
  /\x00/, // NULL bytes
  /[<>"']/, // HTML special chars
];

// Input validation and sanitization
export function isSecureInput(input: string): boolean {
  if (!input || typeof input !== "string") return false;

  // Check against all dangerous patterns
  return !DANGEROUS_PATTERNS.some((pattern) => pattern.test(input));
}

export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";

  return input
    .replace(/<[^>]*>/g, "") // Remove all HTML tags
    .replace(/javascript:/gi, "") // Remove JS protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .replace(/\$\{[^}]*\}/g, "") // Remove template literals
    .replace(/<%[^%]*%>/g, "") // Remove server templates
    .replace(/\{\{[^}]*\}\}/g, "") // Remove template engines
    .replace(/[<>"']/g, "") // Remove HTML special chars
    .replace(/\x00/g, "") // Remove NULL bytes
    .trim();
}

// Enhanced Zod schemas with security
export const secureEmailSchema = z
  .string()
  .min(1, "Email is required")
  .max(100, "Email too long")
  .email("Invalid email format")
  .refine((email) => isSecureInput(email), "Invalid characters detected")
  .transform((email) => sanitizeInput(email.toLowerCase()));

export const securePasswordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password too long")
  .refine((password) => {
    // For passwords, we're more lenient but still block obvious attacks
    const passwordDangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /<\/?\w+/i, // HTML/JS
      /\$\{/,
      /<%/,
      /\{\{/, // Template injections
      /union.*select/i,
      /drop.*table/i, // SQL
    ];
    return !passwordDangerousPatterns.some((pattern) => pattern.test(password));
  }, "Invalid characters detected");

export const secureNameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name too long")
  .refine((name) => isSecureInput(name), "Invalid characters detected")
  .transform((name) => sanitizeInput(name.trim()));

// Simple rate limiting (in-memory)
const rateLimitStore: { [key: string]: { count: number; resetTime: number } } = {};

export function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = `rate_${identifier}`;

  // Clean expired entries
  if (rateLimitStore[key] && rateLimitStore[key].resetTime <= now) {
    delete rateLimitStore[key];
  }

  if (!rateLimitStore[key]) {
    rateLimitStore[key] = { count: 1, resetTime: now + windowMs };
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (rateLimitStore[key].count >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  rateLimitStore[key].count++;
  return { allowed: true, remaining: maxAttempts - rateLimitStore[key].count };
}

// Security headers
export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
};
