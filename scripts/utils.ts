import chalk from "chalk";
import fs from "fs/promises";
import path from "path";
import type { EnvVars } from "./types";

export const log = {
  info: (message: string) => console.log(chalk.blue(message)),
  success: (message: string) => console.log(chalk.green(message)),
  warning: (message: string) => console.log(chalk.yellow(message)),
  error: (message: string) => console.log(chalk.red(message)),
};

export const readEnvFile = async (): Promise<string> => {
  const envPath = path.join(process.cwd(), ".env");
  try {
    return await fs.readFile(envPath, "utf8");
  } catch (error) {
    log.warning("No existing .env file found. Creating a new one.");
    return "";
  }
};

export const updateEnvVars = async (
  newVars: EnvVars,
  sectionName: string,
): Promise<void> => {
  const envPath = path.join(process.cwd(), ".env");
  let envContent = await readEnvFile();

  // Create a new section with the provided variables
  const newSection = `
# ${sectionName}
${Object.entries(newVars)
  .map(([key, value]) => `${key}=${value}`)
  .join("\n")}
`;

  const sectionRegex = new RegExp(`# ${sectionName}[\\s\\S]*?(?=\\n# |$)`, "");
  if (sectionRegex.test(envContent)) {
    // Replace the existing section
    envContent = envContent.replace(sectionRegex, newSection.trim());
  } else {
    // Add the new section at the end
    envContent += newSection;
  }

  try {
    await fs.writeFile(envPath, envContent.trim() + "\n");
    log.success(`Updated .env file with ${sectionName} section`);
  } catch (error) {
    log.error(`Error updating .env file: ${(error as Error).message}`);
  }
};
