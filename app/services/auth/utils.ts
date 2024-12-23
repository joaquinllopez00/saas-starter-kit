import crypto from "crypto";
import * as OTPAuth from "otpauth";
import { appConfig } from "~/config/app.server";
import { TOTP_EXPIRATION_MINUTES } from "~/config/constants";

const PERIOD = TOTP_EXPIRATION_MINUTES * 60;
const DIGITS = 6;
const ALGORITHM = "SHA1";

export const generateTotp = (
  email: string,
): {
  secret: string;
  code: string;
} => {
  const buffer = crypto.randomBytes(20);
  const secret = new OTPAuth.Secret({ buffer });

  const totp = new OTPAuth.TOTP({
    issuer: appConfig.name,
    label: email,
    algorithm: ALGORITHM,
    digits: DIGITS,
    period: PERIOD,
    secret,
  });
  return {
    secret: secret.base32,
    code: totp.generate(),
  };
};

export const verifyTotp = (secret: string, code: string): boolean => {
  const totp = new OTPAuth.TOTP({
    issuer: appConfig.name,
    algorithm: ALGORITHM,
    digits: DIGITS,
    period: PERIOD,
    secret,
  });
  const result = totp.validate({ token: code, window: PERIOD });
  return result !== null;
};

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};
