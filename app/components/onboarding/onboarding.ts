import { Building2Icon, UsersIcon } from "lucide-react";

import type { OnboardingStepProps } from "~/components/onboarding/types";

export const onboardingSteps: OnboardingStepProps[] = [
  {
    id: "Step 1",
    name: "Organization",
    href: "organization",
    title: "Organization",
    description: "Set up your organization",
    icon: Building2Icon,
  },
  {
    id: "Step 2",
    name: "Invitations",
    href: "invitations",
    title: "Invitations",
    description: "Join other organizations",
    icon: Building2Icon,
  },
  {
    id: "Step 3",
    name: "Members",
    href: "members",
    title: "Members",
    description: "Invite users to your organization",
    icon: UsersIcon,
  },
];
