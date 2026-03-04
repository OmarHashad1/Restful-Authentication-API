import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const IV_LENGTH = process.env.IV_LENGTH;
const SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY;

export const encryption = (text) => {
  const iv = crypto.randomBytes(Number(IV_LENGTH));
  const encryptor = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, iv);
  let encryptedText = encryptor.update(text, "utf-8", "hex");
  encryptedText += encryptor.final("hex");
  return `${iv.toString("hex")}:${encryptedText}`;
};

export const decryption = (ciptherText) => {
  const [ivHex, cipher] = ciptherText.split(":");
  const iv = Buffer.from(ivHex,"hex");
  const decryptor = crypto.createDecipheriv("aes-256-cbc", SECRET_KEY, iv);
  let decryptedText = decryptor.update(cipher, "hex", "utf-8");
  decryptedText += decryptor.final("utf-8");
  return decryptedText;
};
