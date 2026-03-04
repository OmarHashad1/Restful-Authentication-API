import { Router } from "express";
import { errorRes, successRes } from "../../utils/response.js";
import * as authService from "./auth.service.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  changePassowrdSchema,
  loginSchema,
  signupSchema,
} from "../../schemas/auth.schema.js";
import { auth, checkRole } from "../../middlewares/auth.middleware.js";
import { logger } from "../../utils/winston.js";
export const authRouter = new Router();

authRouter.post("/signup", validate(signupSchema), async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    age,
    phoneNumber,
    gender = 0,
    provider,
  } = req.body;
  try {
    const payload = await authService.signup({
      firstName,
      lastName,
      email,
      password,
      age,
      phoneNumber,
      gender,
      provider,
    });
    successRes({
      res,
      message: "User created successfully",
      data: payload,
      status: 201,
    });
    logger.info(
      `User signed up: ${firstName} ${lastName} (${email}) with id (${payload._id})`,
    );
  } catch (err) {
    logger.error(
      `Signup failed for ${firstName} ${lastName} (${email}): ${err.message}`,
      { stack: err.stack },
    );
    errorRes({ res, message: err.message });
  }
});

authRouter.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  try {
    const payload = await authService.login({ email, password });
    successRes({
      res,
      message: "logged in successfully",
      data: payload,
      status: 200,
    });
    logger.info(`User logged in: (${email}) `);
  } catch (err) {
    logger.error(`Login failed for ${email} : ${err.message}`, {
      stack: err.stack,
    });
    errorRes({ res, message: err.message });
  }
});

authRouter.get("/refresh-token", async (req, res) => {
  try {
    const [carry, refreshToken] = req.headers.authorization?.split(" ");
    if (!carry == process.env.TOKEN_CARRY) {
      logger.warn(
        `Authorization failed: invalid token carry : ${carry} from ${req.originalUrl}`,
      );
      throw new Error("Invalid token carry");
    }
    const payload = await authService.generateRefreshToken({ refreshToken });
    logger.info(`Access token refreshed successfully`);
    successRes({
      res,
      message: "Access token generated successfully",
      data: payload,
    });
  } catch (err) {
    logger.error(`Refresh token generating failed: ${err.message}`, {
      stack: err.stack,
    });
    errorRes({ res, message: err.message });
  }
});

authRouter.post("/signup/google", async (req, res) => {
  try {
    const { credential } = req.body;
    const data = await authService.googleSignUp({ credential });
    logger.info(
      `Google signup successful for credential: ${credential.substring(0, 20)}...`,
    );
    successRes({ res, data });
  } catch (err) {
    logger.error(`Google signup failed: ${err.message}`, {
      stack: err.stack,
    });
    errorRes({ res, message: err.message, status: 401 });
  }
});

authRouter.post(
  "/change-password",
  auth,
  validate(changePassowrdSchema),
  async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      if (oldPassword == newPassword)
        throw new Error("New password is the same as the old one ");
      const { _id, firstName, lastName, email } = req.user;
      await authService.changePassword({ _id, oldPassword, newPassword });
      logger.info(
        `Password changed successfully for ${firstName} ${lastName} (${email}) (${_id})`,
      );
      successRes({ res, message: "Password changed successfully" });
    } catch (err) {
      logger.error(
        `Password change failed for user (${req.user?._id}): ${err.message}`,
        { stack: err.stack },
      );
      errorRes({ res, message: err.message });
    }
  },
);

authRouter.get("/logout", async (req, res) => {
  try {
    const [carry, authorization] = req.headers.authorization?.split(" ");
    if (!carry == process.env.TOKEN_CARRY) {
      logger.warn(
        `Authorization failed: invalid token carry : ${carry} from ${req.originalUrl}`,
      );
      throw new Error("Invalid token carry");
    }
    await authService.logout({ authorization });
    logger.info(`User logged out successfully`);
    successRes({ res, message: "Logged out successfully" });
  } catch (err) {
    logger.error(`Logout failed: ${err.message}`, { stack: err.stack });
    errorRes({ res, message: err.message });
  }
});
