import "server-only";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import type { SessionUser } from "@/lib/auth";
import type { LoginInput, RegisterInput } from "@/lib/validations/auth";
import User from "@/models/User";

export async function authenticateCredentials(input: LoginInput, role: SessionUser["role"]): Promise<SessionUser | null> {
  await connectToDatabase();
  const user = await User.findOne({ email: input.email.toLowerCase() }).select("+passwordHash name email role accountStatus");
  if (!user || user.accountStatus !== "active" || user.role !== role) return null;
  if (!(await bcrypt.compare(input.password, user.passwordHash))) return null;
  return { id: String(user._id), name: user.name, email: user.email, role: user.role };
}

export async function registerUser(input: RegisterInput): Promise<SessionUser> {
  await connectToDatabase();
  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: await bcrypt.hash(input.password, 12),
    role: "user",
  });
  return { id: String(user._id), name: user.name, email: user.email, role: "user" };
}
