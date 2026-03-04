import jwt from "jsonwebtoken";
import { userModel } from "../models/user/user.model.js";
import { create, findOne } from "../db/db.repo.js";
import { ROLE } from "../enums/user.enum.js";
import { tokenModel } from "../models/token/token.model.js";

export const generateToken = async ({
  payload,
  role = ROLE.user,
  options = {},
  tokenType = "access",
}) => {
  try {
    let secretKey = "";
    switch (tokenType) {
      case "access": {
        secretKey =
          role == ROLE.user
            ? process.env.USER_ACCESS_TOKEN_SIGNATURE
            : process.env.ADMIN_ACCESS_TOKEN_SIGNATURE;
        break;
      }
      case "refresh": {
        secretKey =
          role == ROLE.user
            ? process.env.USER_REFRESH_TOKEN_SIGNATURE
            : process.env.ADMIN_REFRESH_TOKEN_SIGNATURE;
        break;
      }
      default:
        throw new Error("Invalid token type");
    }

    let token = "";

    if (tokenType === "access") {
      token = jwt.sign(payload, secretKey, options);
    }

    if (tokenType === "refresh") {
      const jti = crypto.randomUUID();
      token = jwt.sign(
        {
          payload,
          jti,
        },
        secretKey,
        options,
      );

      await create({
        model: tokenModel,
        data: {
          userId: payload._id,
          jti,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    return token;
  } catch (err) {
    throw new Error(err);
  }
};

export const verifyToken = ({
  token,
  role = ROLE.user,
  tokenType = "access",
}) => {
  try {
    let secretKey = "";
    switch (tokenType) {
      case "access": {
        secretKey =
          role == ROLE.user
            ? process.env.USER_ACCESS_TOKEN_SIGNATURE
            : process.env.ADMIN_ACCESS_TOKEN_SIGNATURE;
        break;
      }
      case "refresh": {
        secretKey =
          role == ROLE.user
            ? process.env.USER_REFRESH_TOKEN_SIGNATURE
            : process.env.ADMIN_REFRESH_TOKEN_SIGNATURE;
        break;
      }
      default:
        throw new Error("Invalid token type");
    }
    return jwt.verify(token, secretKey);
  } catch (err) {
    throw new Error(err);
  }
};

export const decodeToken = async ({ token, tokenType = "access" }) => {
  try {
    const decodedUser = jwt.decode(token);
    const payload = verifyToken({ token, role: decodedUser.role, tokenType });
    const userId = tokenType === "refresh" ? payload.payload._id : payload._id;
    const user = await findOne({
      model: userModel,
      filter: { _id: userId },
      select: "firstName lastName email role gender credentialChangedAt",
    });
    if (
      user.credentialChangedAt &&
      payload.iat < user.credentialChangedAt.getTime() / 1000
    ) {
      throw new Error("Token is no longer valid. Please login again.");
    }
    return user;
  } catch (err) {
    throw new Error(err);
  }
};

export const generateTokens = async ({ id, role }) => {
  const accessToken = await generateToken({
    payload: { _id: id, role: role },
    role: role,
    options: { expiresIn: "30M" },
  });
  const refreshToken = await generateToken({
    payload: { _id: id, role: role },
    role: role,
    options: { expiresIn: "1W" },
    tokenType: "refresh",
  });

  return {
    accessToken,
    refreshToken,
  };
};
