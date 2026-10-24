import { Schema, model, models, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user", required: true },
    accountStatus: { type: String, enum: ["active", "suspended"], default: "active", required: true },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof userSchema>;
const User = models.User || model("User", userSchema);
export default User;
