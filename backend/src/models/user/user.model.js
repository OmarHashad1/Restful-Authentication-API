import { model, Schema } from "mongoose";
import { GENDER, PROVIDER, ROLE } from "../../enums/user.enum.js";
import { decryption, encryption } from "../../utils/encryption.js";

export const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 30,
    },
    lastName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 30,
    },
    email: {
      type: String,
      index: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === PROVIDER.system;
      },
    },
    role: {
      type: Number,
      default: ROLE.user,
      enums: Object.values(ROLE),
    },
    gender: {
      type: Number,
      default: GENDER.male,
      enums: Object.values(GENDER),
    },
    age: {
      type: Number,
    },
    provider: {
      type: Number,
      enums: Object.values(PROVIDER),
      default: PROVIDER.system,
    },
    isEmailConfirmed: {
      type: Boolean,
      default: false,
    },
    credentialChangedAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
    phoneNumber: {
      type: String,
      set: function (value) {
        return encryption(value);
      },
      get: function (value) {
        return decryption(value);
      },
    },
    picture: {
      type: String,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  },
);

export const userModel = model("User", userSchema);
