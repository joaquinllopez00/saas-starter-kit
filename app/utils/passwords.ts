import bcrypt from "bcryptjs";

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  inputPassword: string,
  hashedPassword: string,
) => {
  return bcrypt.compare(inputPassword, hashedPassword);
};
