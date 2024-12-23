import { z } from "zod";

export const EmailSchema = z
  .string({ required_error: "Email is required" })
  .email({ message: "Email is invalid" })
  .min(3, { message: "Email is too short" })
  .max(100, { message: "Email is too long" })
  .transform((value) => value.toLowerCase());

export const PasswordSchema = z
  .string({ required_error: "Password is required" })
  .min(6, { message: "Password is too short" })
  .max(100, { message: "Password is too long" })
  .refine((value) => !/\s/.test(value), {
    message: "Password cannot contain spaces",
  })
  .refine((value) => /\d/.test(value), {
    message: "Password must contain at least one number",
  })
  .refine((value) => /[A-Z]/.test(value), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((value) => /[a-z]/.test(value), {
    message: "Password must contain at least one lowercase letter",
  })
  .refine((value) => /[^A-Za-z0-9]/.test(value), {
    message: "Password must contain at least one special character",
  });
