import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const poolConfig = {
  service: "Gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const smtpTransport = {
  from: process.env.SMTP_USER,
  to: "",
};

const transporter = nodemailer.createTransport(poolConfig);

export const sendMail = ({ email, fullName }) => {
  try {
    transporter.sendMail(
      {
        from: process.env.SMTP_USER,
        to: email,
        subject: `Welcome ${fullName}`,
        text: "You have successfully signup!",
      },
      (err, info) => {
        if (err) {
          console.error(err);
          return;
        }
        
      },
    );
  } catch (err) {
    throw new Error(err);
  }
};
