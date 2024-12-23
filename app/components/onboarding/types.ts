import type { IconProperty } from "~/components/types";

export type StepProps = {
  id: string;
  name: string;
  href: string;
  title: string;
  description: string;
  icon: IconProperty;
};

export type OnboardingStepProps = StepProps;
