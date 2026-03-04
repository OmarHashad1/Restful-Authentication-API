import joi from "joi";
import { GENDER, PROVIDER, ROLE } from "../enums/user.enum.js";
export const signupSchema = {
  body: joi.object({
    firstName: joi.string().min(3).max(30).required(),
    lastName: joi.string().min(3).max(30).required(),
    email: joi.string().email().required(),
    password: joi.string(),
    role: joi.number().valid(...Object.values(ROLE)),
    gender: joi.number().valid(...Object.values(GENDER)),
    age: joi.number().min(15).max(90),
    provider: joi.number().valid(...Object.values(PROVIDER)),
    phoneNumber: joi.string(),
    picture: joi.string(),
  }),
};

export const loginSchema = {
  body: joi.object({
    email: joi.string().email().required(),
    password: joi.string(),
  }),

};

export const updateSchema = {
  body: joi.object({
    firstName: joi.string().min(3).max(30).required(),
    lastName: joi.string().min(3).max(30).required(),
    email: joi.string().email().required(),
    phoneNumber: joi.string(),
  }),
};

export const changePassowrdSchema = {
  body: joi.object({
    oldPassword: joi.string().required(),
    newPassword: joi.string()
      .invalid(joi.ref("oldPassword"))
      .required()
      .messages({
        "any.invalid": "New password must be different from old password",
      }),
  }),
};
