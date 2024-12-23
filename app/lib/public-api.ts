import * as crypto from "crypto";

export const generateApiKey = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashApiKey = async (apiKey: string): Promise<string> => {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
};
