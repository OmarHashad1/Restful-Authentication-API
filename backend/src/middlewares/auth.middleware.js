import { decodeToken } from "../utils/token.js";
import { errorRes } from "../utils/response.js";
import { logger } from "../utils/winston.js";

export const auth = async (req, res, next) => {
  try {
    const [start, token] = req.headers.authorization?.split(" ");
    if (!start == process.env.TOKEN_CARRY) {
      logger.warn(
        `Authorization failed: invalid token carry : ${start} from ${req.originalUrl}`,
      );
      errorRes({ res, message: "Invalid token carry" });
    }
    const user = await decodeToken({
      token: token,
      tokenType: "access",
    });
    if (!user) {
      logger.warn(
        `Authorization failed: user not found from token : ${token} accessing ${req.method} ${req.originalUrl}`,
      );
      return errorRes({ res, message: "user not found" });
    }
    req.user = user;
    logger.info(
      `User authenticated: ${user.firstName} ${user.lastName} (${user._id}) accessing ${req.method} ${req.originalUrl}`,
    );
    next();
  } catch (err) {
    errorRes({ res, message: err.message });
  }
};

export const checkRole = (allowed_roles = []) => {
  return (req, res, next) => {
    const user = req.user;

    if (!allowed_roles.includes(user.role)) {
      logger.warn(
        `Unauthorized access attempt by user: ${user.firstName} ${user.lastName} (${user._id}) accessing ${req.method} ${req.originalUrl}`,
      );

      return errorRes({ res, message: "user not authorized", status: 401 });
    }
    logger.info(
      `User authorized: ${user.firstName} ${user.lastName} (${user._id}) with role [${user.role}] accessing ${req.method} ${req.originalUrl}`,
    );
    return next();
  };
};
