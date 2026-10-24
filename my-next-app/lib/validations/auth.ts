import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  password: z.string().min(10, "Use at least 10 characters.").max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(254),
  password: z.string().min(1, "Enter your password.").max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
