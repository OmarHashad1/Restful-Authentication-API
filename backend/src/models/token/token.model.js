import { Schema, model } from "mongoose";

const tokenSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  jti: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const tokenModel = model("token", tokenSchema);
