import { z } from "zod";
import { uuidv4 } from "~/lib/string";

export const toastKey = "toast";
export const ToastSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  id: z.string().default(() => uuidv4()),
  type: z.enum(["message", "success", "error"]).default("message"),
});
export type ToastInput = z.input<typeof ToastSchema>;
