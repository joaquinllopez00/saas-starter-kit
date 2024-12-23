import { and, desc, eq } from "drizzle-orm";
import { IssuesTable, UsersTable, db } from "~/drizzle/schema";
import type { Issue, IssueInsert, IssueUpdate } from "~/services/db/types";

export const findIssuesByOrganizationId = async (
  organizationId: number,
  limit: number = 10,
  offset: number = 0,
): Promise<Issue[]> => {
  return db
    .select({
      id: IssuesTable.id,
      title: IssuesTable.title,
      description: IssuesTable.description,
      label: IssuesTable.label,
      status: IssuesTable.status,
      priority: IssuesTable.priority,
    })
    .from(IssuesTable)
    .where(eq(IssuesTable.organizationId, organizationId))
    .limit(limit)
    .offset(offset);
};

export const findIssueByOrganizationId = async (
  issueId: number,
  organizationId: number,
): Promise<Issue | undefined> => {
  const issues = await db
    .select({
      id: IssuesTable.id,
      title: IssuesTable.title,
      description: IssuesTable.description,
      label: IssuesTable.label,
      status: IssuesTable.status,
      priority: IssuesTable.priority,
    })
    .from(IssuesTable)
    .where(
      and(
        eq(IssuesTable.id, issueId),
        eq(IssuesTable.organizationId, organizationId),
      ),
    )
    .limit(1);

  return issues[0];
};

export const findIssuesForUserOrganization = async (
  userId: number,
  paginationParams: {
    limit: number;
    offset: number;
  },
): Promise<Issue[]> => {
  return db
    .select({
      id: IssuesTable.id,
      title: IssuesTable.title,
      description: IssuesTable.description,
      label: IssuesTable.label,
      status: IssuesTable.status,
      priority: IssuesTable.priority,
    })
    .from(IssuesTable)
    .innerJoin(
      UsersTable,
      eq(UsersTable.defaultOrganizationId, IssuesTable.organizationId),
    )
    .orderBy(desc(IssuesTable.createdAt))
    .where(
      and(
        eq(UsersTable.id, userId),
        eq(IssuesTable.organizationId, UsersTable.defaultOrganizationId),
      ),
    )
    .limit(paginationParams.limit)
    .offset(paginationParams.offset);
};

export const findIssueForUserOrganization = async (
  issueId: number,
  userId: number,
): Promise<Issue | undefined> => {
  const issues = await db
    .select({
      id: IssuesTable.id,
      title: IssuesTable.title,
      description: IssuesTable.description,
      label: IssuesTable.label,
      status: IssuesTable.status,
      priority: IssuesTable.priority,
    })
    .from(IssuesTable)
    .innerJoin(
      UsersTable,
      eq(UsersTable.defaultOrganizationId, IssuesTable.organizationId),
    )
    .where(
      and(
        eq(IssuesTable.id, issueId),
        eq(UsersTable.id, userId),
        eq(IssuesTable.organizationId, UsersTable.defaultOrganizationId),
      ),
    )
    .limit(1);

  return issues[0];
};

export const insertIssue = async (issueInsert: IssueInsert): Promise<Issue> => {
  try {
    const result = await db.insert(IssuesTable).values(issueInsert).returning();
    return result[0];
  } catch (e) {
    throw e;
  }
};

export const updateIssue = async (
  issueId: number,
  issueUpdate: Partial<IssueUpdate>,
): Promise<any> => {
  return db
    .update(IssuesTable)
    .set({
      ...issueUpdate,
      updatedAt: new Date(),
    })
    .where(eq(IssuesTable.id, issueId));
};
