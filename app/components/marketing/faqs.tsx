import { Faq } from "~/components/marketing/faq";

import type { FaqProps } from "~/components/marketing/types";

const faqs: FaqProps[] = [
  {
    question: "What is the refund policy?",
    answer:
      "We offer a 30-day money-back guarantee no questions asked. If you are not happy with our product, then we will refund your entire purchase.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Yes, you can cancel your subscription at any time. Your subscription will remain active until the end of the billing cycle.",
  },
  {
    question: "Do you offer support for free?",
    answer:
      "Yes, we offer free support for all our customers. Our support team is available 24/7 to help you with any questions or issues you may have.",
  },
  {
    question: "How do I contact support?",
    answer:
      "You can contact our support team by sending an email to support@Base-kit.dev",
  },
];
export const Faqs = () => {
  return (
    <div className="mx-auto my-6 max-w-7xl sm:my-12">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Frequently Asked Questions
        </p>
        <p className="text-md mt-2 text-muted-foreground sm:mt-6">
          Here is where you can answer common questions about your SaaS product.
          Generally these are questions about pricing, refunds, support, and
          other common concerns.
        </p>
      </div>
      <div className={"mt-6 max-w-2xl sm:mt-8"}>
        {faqs.map((faq) => (
          <Faq key={faq.question} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
};
