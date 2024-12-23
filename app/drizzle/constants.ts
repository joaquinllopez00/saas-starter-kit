export const issueStatusEnumValues = [
  "in progress",
  "backlog",
  "todo",
  "canceled",
  "done",
] as const;

export const issuePriorityEnumValues = ["high", "medium", "low"] as const;
export const issueLabelEnumValues = ["bug", "feature", "enhancement"] as const;

export const adminRoleName = "admin";
export const userRoleName = "user";

export const permissionActionEnumValues = ["read", "write"] as const;

export const permissionAccessEnumValues = ["any", "own"] as const;
export const permissionEntityEnumValues = [
  "issues",
  "members",
  "settings",
] as const;

export const verificationTypeEnumValues = ["email", "password-reset"] as const;
export const onboardingStatusEnumValues = [
  "not_started",
  "in_progress",
  "complete",
] as const;
