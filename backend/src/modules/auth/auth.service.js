import {
  create,
  deleteOne,
  findByEmail,
  findOne,
  update,
} from "../../db/db.repo.js";
import { userModel } from "../../models/user/user.model.js";
import * as argon2 from "argon2";
import {
  generateToken,
  decodeToken,
  generateTokens,
  verifyToken,
} from "../../utils/token.js";
import { OAuth2Client } from "google-auth-library";
import { PROVIDER } from "../../enums/user.enum.js";
import { tokenModel } from "../../models/token/token.model.js";
import { logger } from "../../utils/winston.js";

const client = new OAuth2Client();

export const signup = async ({
  firstName,
  lastName,
  email,
  password,
  age,
  phoneNumber,
  gender,
  provider,
}) => {
  const hashedPassword = password ? await argon2.hash(password) : undefined;
  const user = await create({
    model: userModel,
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      age,
      phoneNumber,
      gender,
      provider,
    },
  });

  if (!user) throw new Error("Something wrong in creating user");
  sendMail({ email: user.email, fullName: user.firstName });
  return user;
};

export const login = async ({ email, password }) => {
  const user = await findOne({ model: userModel, filter: { email } });

  if (!user || !user.password) throw new Error("Invalid Credentials");

  if (user.provider == PROVIDER.google)
    throw new Error(
      "this account is associated with google. Try signin with google option",
    );

  if (!(await argon2.verify(user.password, password)))
    throw new Error("Invalid Credentials");

  const accessToken = await generateToken({
    payload: { _id: user._id, role: user.role },
    role: user.role,
    options: { expiresIn: "30M" },
  });

  const refreshToken = await generateToken({
    payload: { _id: user._id, role: user.role },
    role: user.role,
    options: { expiresIn: "1W" },
    tokenType: "refresh",
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const generateRefreshToken = async ({ refreshToken }) => {
  const user = await decodeToken({ token: refreshToken, tokenType: "refresh" });
  if (!user) throw new Error("user not found!");

  const payload = verifyToken({
    token: refreshToken,
    role: user.role,
    tokenType: "refresh",
  });

  const { jti: storedJti } = await findOne({
    model: tokenModel,
    filter: { jti: payload.jti },
    select: "-_id -userId -expiresAt -__v",
  });

  if (!storedJti) throw new Error("Invalid Token");

  const accessToken = await generateToken({
    payload: { _id: user._id },
    options: { expiresIn: "1W" },
    tokenType: "access",
  });

  return {
    accessToken,
  };
};

export const googleSignUp = async ({ credential }) => {
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.CLIENT_ID,
  });

  const {
    email,
    given_name: firstName,
    family_name: lastName,
    email_verified: isEmailConfirmed,
    picture,
  } = ticket.getPayload();

  const existingUser = await findByEmail({ model: userModel, email });

  if (existingUser?.provider === PROVIDER.system)
    throw new Error(
      "This account uses Saraha login. Use the login form instead.",
    );

  let user;
  if (existingUser) {
    logger.info(`Google sign-in for existing user: ${firstName} ${lastName} (${email})`);
    user = existingUser;
  } else {
    user = await create({
      model: userModel,
      data: {
        firstName,
        lastName,
        email,
        isEmailConfirmed,
        picture,
        provider: PROVIDER.google,
      },
    });
    logger.info(`New user signed up via Google: ${firstName} ${lastName} (${email}) (${user._id})`);
  }

  return generateTokens({ id: user._id, role: user.role });
};

export const changePassword = async ({ _id, oldPassword, newPassword }) => {
  const user = await findOne({
    model: userModel,
    filter: { _id },
    select: "password provider -_id",
    options: { lean: true },
  });

  if (user.provider > 0) {
    throw new Error("Change password service is not available for goole users");
  }

  if (!(await argon2.verify(user.password, oldPassword))) {
    throw new Error("Old password is wrong");
  }

  const hashedPassword = await argon2.hash(newPassword);

  await update({
    model: userModel,
    filter: { _id },
    data: {
      password: hashedPassword,
      credentialChangedAt: new Date(),
    },
  });
};

export const logout = async ({ authorization }) => {
  const decoded = await decodeToken({
    token: authorization,
    tokenType: "refresh",
  });
  const payload = verifyToken({
    token: authorization,
    role: decoded.role,
    tokenType: "refresh",
  });
  await deleteOne({ model: tokenModel, filter: { jti: payload.jti } });
};
