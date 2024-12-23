// @ts-nocheck
import * as crypto from "crypto";

export const uuidv4 = () => {
  return crypto.randomUUID();
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
