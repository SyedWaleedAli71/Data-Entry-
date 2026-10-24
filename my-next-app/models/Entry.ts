import { Schema, model, models, type InferSchemaType } from "mongoose";

const entrySchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    status: { type: String, enum: ["new", "in_progress", "completed"], default: "new", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true },
);

entrySchema.index({ createdAt: -1 });
entrySchema.index({ title: "text", fullName: "text", email: "text" });

export type EntryDocument = InferSchemaType<typeof entrySchema>;
const Entry = models.Entry || model("Entry", entrySchema);
export default Entry;
