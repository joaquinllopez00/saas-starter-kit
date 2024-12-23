import type {
  issueLabelEnumValues,
  issuePriorityEnumValues,
  issueStatusEnumValues,
} from "~/drizzle/constants";

export type IssueLabel = (typeof issueLabelEnumValues)[number];
export type IssueStatus = (typeof issueStatusEnumValues)[number];
export type IssuePriority = (typeof issuePriorityEnumValues)[number];
