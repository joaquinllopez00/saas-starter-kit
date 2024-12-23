#!/usr/bin/env node
import chalk from "chalk";
import { program } from "commander";
import "dotenv/config";
import enquirer from "enquirer";
import Stripe from "stripe";

import type { SubscriptionDictionary } from "../app/services/payments/types";
import { log } from "./utils";

program
  .version("1.0.0")
  .description("Stripe Pricing Model and Customer Portal CLI")
  .option("--webhook", "Create a Stripe webhook");

if (!process.env.STRIPE_SECRET_KEY) {
  log.error("STRIPE_SECRET_KEY is not set in the environment variables.");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const createProduct = async (name: string): Promise<Stripe.Product> => {
  try {
    return await stripe.products.create({ name });
  } catch (error) {
    log.error(`Error creating product: ${(error as Error).message}`);
    throw error;
  }
};

const createPrice = async (
  productId: string,
  amount: number,
  interval: "month" | "year",
): Promise<Stripe.Price> => {
  try {
    return await stripe.prices.create({
      product: productId,
      unit_amount: amount,
      currency: "usd",
      recurring: { interval },
    });
  } catch (error) {
    log.error(`Error creating price: ${(error as Error).message}`);
    throw error;
  }
};

const getTierNames = async (): Promise<string[]> => {
  const { numberOfTiers } = await enquirer.prompt<{ numberOfTiers: number }>({
    type: "number",
    name: "numberOfTiers",
    message: "How many pricing tiers would you like to create?",
    initial: 3,
  });

  const tiers: string[] = [];
  for (let i = 0; i < numberOfTiers; i++) {
    const { tierName } = await enquirer.prompt<{ tierName: string }>({
      type: "input",
      name: "tierName",
      message: `Enter the name for tier ${i + 1}:`,
    });
    tiers.push(tierName);
  }

  return tiers;
};

const setupCustomerPortal = async (
  products: Stripe.Product[],
  prices: Stripe.Price[],
): Promise<void> => {
  log.info("Setting up Customer Portal...");

  const { businessName } = await enquirer.prompt<{ businessName: string }>({
    type: "input",
    name: "businessName",
    message: "Enter the name of your business:",
  });

  try {
    const configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: businessName,
      },
      features: {
        invoice_history: {
          enabled: true,
        },
        payment_method_update: {
          enabled: true,
        },
        subscription_cancel: {
          enabled: true,
        },
        subscription_update: {
          enabled: true,
          default_allowed_updates: ["price"],
          products: products.map((product) => ({
            product: product.id,
            prices: prices
              .filter((price) => price.product === product.id)
              .map((price) => price.id),
          })),
        },
      },
      default_return_url: "https://localhost:3000",
    });

    log.success("Billing portal configuration created successfully:");
    console.log(configuration);
  } catch (error) {
    log.error(
      `Failed to create billing portal configuration: ${
        (error as Error).message
      }`,
    );
  }
};

const generateSubscriptionConfig = async (
  products: Stripe.Product[],
): Promise<SubscriptionDictionary> => {
  const config: SubscriptionDictionary = {};

  for (const product of products) {
    const { features } = await enquirer.prompt<{
      features: Record<string, number>;
    }>({
      type: "form",
      name: "features",
      message: `Enter feature details for ${product.name}:`,
      choices: [
        {
          name: "users",
          message: "Number of Users (-1 for unlimited)",
          initial: "1",
          validate: (value: string) => {
            const num = parseInt(value);
            return Number.isInteger(num) && num >= -1
              ? true
              : "Must be an integer >= -1";
          },
          result: (value: string) => parseInt(value),
        },
        {
          name: "issues",
          message: "Number of Issues (-1 for unlimited)",
          initial: "100",
          validate: (value: string) => {
            const num = parseInt(value);
            return Number.isInteger(num) && num >= -1
              ? true
              : "Must be an integer >= -1";
          },
          result: (value: string) => parseInt(value),
        },
        {
          name: "storage",
          message: "Storage in GB",
          initial: "5",
          validate: (value: string) => {
            const num = parseFloat(value);
            return !isNaN(num) && num >= 0 ? true : "Must be a number >= 0";
          },
          result: (value: string) => parseInt(value),
        },
      ],
    });

    const { isRecommended } = await enquirer.prompt<{ isRecommended: boolean }>(
      {
        type: "confirm",
        name: "isRecommended",
        message: `Is ${product.name} the recommended tier?`,
        initial: false,
      },
    );

    config[product.id] = {
      ...(isRecommended && { isRecommended: true }),
      features: [
        {
          name: "Users",
          key: "users",
          value: features.users,
          description: `${
            features.users === -1 ? "Unlimited" : features.users
          } users`,
        },
        {
          name: "Issues",
          key: "issues",
          value: features.issues,
          description: `${
            features.issues === -1 ? "Unlimited" : features.issues
          } issues`,
        },
        {
          name: "Storage",
          key: "storage",
          value: features.storage,
          description: `${features.storage}GBs of storage`,
        },
      ],
    };
  }

  return config;
};

const createWebhook = async (): Promise<void> => {
  log.info("Setting up Stripe webhook...");

  const { webhookUrl } = await enquirer.prompt<{ webhookUrl: string }>({
    type: "input",
    name: "webhookUrl",
    message: "Enter the URL for your webhook endpoint:",
  });

  try {
    const webhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: [
        "customer.subscription.updated",
        "customer.subscription.deleted",
        "checkout.session.completed",
      ],
    });

    log.success("Webhook created successfully:");
    console.log(webhook);

    log.info("Webhook Secret (save this as an environment variable):");
    console.log(chalk.yellow(webhook.secret));
    log.info("Add this to your .env file as STRIPE_WEBHOOK_SECRET=<secret>");
  } catch (error) {
    log.error(`Failed to create webhook: ${(error as Error).message}`);
  }
};

const main = async (): Promise<void> => {
  log.success("Welcome to the Stripe Pricing Model and Customer Portal CLI");

  const options = program.opts();

  if (options.webhook) {
    await createWebhook();
    return;
  }

  const tiers = await getTierNames();
  const products: Stripe.Product[] = [];
  const prices: Stripe.Price[] = [];

  for (const tier of tiers) {
    const product = await createProduct(tier);
    products.push(product);

    const { monthlyPrice } = await enquirer.prompt<{ monthlyPrice: number }>({
      type: "numeral",
      name: "monthlyPrice",
      message: `Enter the monthly price for ${tier} in dollars (e.g., 10 for $10):`,
      validate: (input: number) => input > 0 || "Price must be greater than 0",
      result: (input: number) => Math.round(input * 100),
    });

    const monthlyPriceObject = await createPrice(
      product.id,
      monthlyPrice,
      "month",
    );
    prices.push(monthlyPriceObject);

    const annualPriceDefault = monthlyPrice * 10;

    const { confirmAnnual } = await enquirer.prompt<{ confirmAnnual: boolean }>(
      {
        type: "confirm",
        name: "confirmAnnual",
        message: `Is the annual price for ${tier} $${
          annualPriceDefault / 100
        } (10x monthly)?`,
        initial: true,
      },
    );

    let annualPrice: number;
    if (!confirmAnnual) {
      const response = await enquirer.prompt<{ annualPrice: number }>({
        type: "numeral",
        name: "annualPrice",
        message: `Enter the annual price for ${tier} in dollars:`,
        initial: annualPriceDefault / 100,
        validate: (input: number) =>
          input > 0 || "Price must be greater than 0",
        result: (input: number) => Math.round(input * 100),
      });
      annualPrice = response.annualPrice;
    } else {
      annualPrice = annualPriceDefault;
    }

    const annualPriceObject = await createPrice(
      product.id,
      annualPrice,
      "year",
    );
    prices.push(annualPriceObject);

    // Update the product with the default price (monthly)
    await stripe.products.update(product.id, {
      default_price: monthlyPriceObject.id,
    });
  }

  log.success("Products and prices created successfully.");

  // Set up customer portal
  await setupCustomerPortal(products, prices);

  // Generate subscription config
  const config = await generateSubscriptionConfig(products);

  // Output the configuration in the desired format
  console.log(chalk.green("Subscription Configuration:"));
  console.log(
    `export const subscriptionTiers: SubscriptionDictionary = ${JSON.stringify(
      config,
      null,
      2,
    )};`,
  );
  console.log(
    `\nexport const stripeProducts = ${JSON.stringify(Object.keys(config))};`,
  );

  log.success("All done!");
  log.info(
    "Copy the output above and use it to update your subscription configuration in subscription.ts.",
  );
};

program.action(main);

program.parse(process.argv);
