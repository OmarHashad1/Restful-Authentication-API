import { Router } from "express";
import { auth, checkRole } from "../../middlewares/auth.middleware.js";
import { errorRes, successRes } from "../../utils/response.js";
import * as userService from "./user.service.js";
import { ROLE } from "../../enums/user.enum.js";
import { logger } from "../../utils/winston.js";

export const userRouter = new Router();

userRouter.get("/profile", auth, (req, res) => {
  const { _id, firstName, lastName, email } = req.user;
  logger.info(`Profile fetched for ${firstName} ${lastName} (${email}) (${_id})`);
  successRes({ res, data: req.user });
});

userRouter.patch("/update-profile", auth, async (req, res) => {
  try {
    const { _id, email: userEmail } = req.user;
    const { firstName, lastName, email, phoneNumber } = req.body;
    const payload = await userService.updateProfile({
      _id,
      userEmail,
      firstName,
      lastName,
      email,
      phoneNumber,
    });
    logger.info(`Profile updated for ${req.user.firstName} ${req.user.lastName} (${userEmail}) (${_id})`);
    successRes({
      res,
      message: "User profile updated successfully",
      data: payload,
    });
  } catch (err) {
    logger.error(`Profile update failed for user (${req.user?._id}): ${err.message}`, { stack: err.stack });
    errorRes({ res, message: err.message });
  }
});
