import mongoose from "mongoose";
import { logger } from "../utils/winston.js";

export const DBConnection = async () => {
  try {
    const URI = process.env.URI;
    await mongoose.connect(URI);
    logger.info("DB connected successfully");
  } catch (err) {
    logger.error(`DB connection failed: ${err.message}`, { stack: err.stack });
    throw new Error(err);
  }
};
