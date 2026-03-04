import express from "express";
import { DBConnection } from "./config/db.js";
import "./models/user/user.virtuals.js";
import { userRouter } from "./modules/user/user.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { userModel } from "./models/user/user.model.js";
import cors from "cors";
import { tokenModel } from "./models/token/token.model.js";
import { logger } from "./utils/winston.js";
import { requestedAt } from "./middlewares/requestedAt.middleware.js";
export const bootstrap = async () => {
  const app = express();

  const PORT = process.env.PORT;
  await DBConnection();
  await userModel.createIndexes();

  app.use(express.json());
  app.use(cors());
  app.use(requestedAt);
  app.use("/user", userRouter);
  app.use("/auth", authRouter);

  app.all("{/*dummy}", (req, res, next) => {
    logger.warn(`Route not found: [${req.method}] ${req.url}`);
    throw new Error(`page ${req.url} with method ${req.method} not found`);
  });

  app.use((err, req, res, next) => {
    if (err) {
      logger.error(`[${req.method}] ${req.url} - ${err.message}`, {
        stack: err.stack,
      });
      res.status(err.cause?.status || 500).json({
        status: err.cause?.status || 500,
        message: err.message,
      });
    }
  });

  app.listen(PORT, () => logger.info(`Server listening on port ${PORT}`));
};
