import { z } from "zod";

export const entrySchema = z.object({
  fullName: z.string().trim().min(2, "Enter the full name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(30),
  title: z.string().trim().min(2, "Enter a title.").max(150),
  category: z.string().trim().min(2, "Enter a category.").max(80),
  description: z.string().trim().min(5, "Add a short description.").max(3000),
  status: z.enum(["new", "in_progress", "completed"]),
});

export type EntryInput = z.infer<typeof entrySchema>;
