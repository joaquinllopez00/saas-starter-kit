import path from "path";

export const sanitizeFilename = (filename: string): string => {
  let sanitized = path.basename(filename);
  sanitized = sanitized.replace(/[^a-zA-Z0-9.-]/g, "_");
  return sanitized || "unnamed_file";
};
