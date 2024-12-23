import "dotenv/config";
import {
  adminRoleName,
  issueLabelEnumValues,
  issuePriorityEnumValues,
  issueStatusEnumValues,
  userRoleName,
} from "~/drizzle/constants";
import type { IssueInsert } from "~/services/db/types";
import { hashPassword } from "~/utils/passwords";
import {
  IssuesTable,
  OrganizationsTable,
  PermissionsTable,
  RolesTable,
  RolesToPermissionsTable,
  UsersTable,
  UsersToOrganizationsTable,
  db,
} from "../schema";

// @ts-expect-error
const setupRolesAndPermissions = async (tx) => {
  const adminRole = await tx
    .insert(RolesTable)
    .values({
      name: adminRoleName,
      displayName: "Admin",
      description: "Admin role",
    })
    .returning();

  const userRole = await tx
    .insert(RolesTable)
    .values({
      name: userRoleName,
      displayName: "User",
      description: "User role",
    })
    .returning();

  const adminRoleId = adminRole[0].id;
  const userRoleId = userRole[0].id;
  console.log("Roles created");

  const readIssuePermission = await tx
    .insert(PermissionsTable)
    .values({
      entity: "issues",
      action: "read",
      access: "any",
      description: "Read any issue",
    })
    .returning();

  const writeIssuePermission = await tx
    .insert(PermissionsTable)
    .values({
      entity: "issues",
      action: "write",
      access: "any",
      description: "Write any issue",
    })
    .returning();

  const readMemberPermission = await tx
    .insert(PermissionsTable)
    .values({
      entity: "members",
      action: "read",
      access: "any",
      description: "Read any member",
    })
    .returning();

  const writeMemberPermission = await tx
    .insert(PermissionsTable)
    .values({
      entity: "members",
      action: "write",
      access: "any",
      description: "Write any member",
    })
    .returning();

  const readSettingsPermission = await tx
    .insert(PermissionsTable)
    .values({
      entity: "settings",
      action: "read",
      access: "any",
      description: "Read any settings",
    })
    .returning();

  const writeSettingsPermission = await tx
    .insert(PermissionsTable)
    .values({
      entity: "settings",
      action: "write",
      access: "any",
      description: "Write any settings",
    })
    .returning();

  const adminPermissions = [
    readIssuePermission[0].id,
    writeIssuePermission[0].id,
    readMemberPermission[0].id,
    writeMemberPermission[0].id,
    readSettingsPermission[0].id,
    writeSettingsPermission[0].id,
  ];

  const userPermissions = [
    readIssuePermission[0].id,
    writeIssuePermission[0].id,
    readMemberPermission[0].id,
    readSettingsPermission[0].id,
  ];

  for (const permissionId of adminPermissions) {
    await tx.insert(RolesToPermissionsTable).values({
      roleId: adminRoleId,
      permissionId,
    });
  }

  for (const permissionId of userPermissions) {
    await tx.insert(RolesToPermissionsTable).values({
      roleId: userRoleId,
      permissionId,
    });
  }

  return {
    adminRoleId,
  };
};

// @ts-expect-error
const setupUserAndOrganization = async (tx, adminRoleId) => {
  const organization = await tx
    .insert(OrganizationsTable)
    .values({
      name: "Hawkins Inc.",
    })
    .returning();

  const organizationId = organization[0].id;

  const user = await tx
    .insert(UsersTable)
    .values({
      firstName: "Dustin",
      lastName: "Henderson",
      email: "dustin@hawkins.com",
      password: await hashPassword("password"),
      accountVerified: true,
      defaultOrganizationId: organizationId,
    })
    .returning();

  const userId = user[0].id;

  await tx.insert(UsersToOrganizationsTable).values({
    userId: userId,
    organizationId: organizationId,
    roleId: adminRoleId,
  });
  console.log("Default user and organization created");
  return {
    userId,
    organizationId,
  };
};

const randomValueInArr = <T>(arr: T[]): T => {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
};

// @ts-expect-error
const setupIssues = async (tx, userId, organizationId) => {
  const dummyIssueTitlesAndDescriptions = [
    {
      title: "Fix the bug",
      description: "The bug is causing the app to crash. Fix it ASAP. ",
    },
    {
      title: "Add a new feature",
      description: "Add a feature that allows users to upload images.",
    },
    {
      title: "Update the UI",
      description: "The UI needs to be updated to match the new design.",
    },
    {
      title: "Optimize the app",
      description: "The app is running slow. Optimize it.",
    },
    {
      title: "Add a new endpoint",
      description: "Add a new endpoint for the new feature.",
    },
    {
      title: "Find the memory leak",
      description: "The app is using too much memory. Find the memory leak.",
    },
    {
      title: "Refactor the code",
      description: "The code in the file is too long. Refactor it.",
    },
    {
      title: "Filter the data on the frontend",
      description: "The data is not being filtered correctly. Fix it.",
    },
  ];
  for (const value of dummyIssueTitlesAndDescriptions) {
    await tx.insert(IssuesTable).values({
      title: value.title,
      description: value.description,
      status: randomValueInArr([...issueStatusEnumValues]),
      priority: randomValueInArr([...issuePriorityEnumValues]),
      label: randomValueInArr([...issueLabelEnumValues]),
      organizationId: organizationId,
    } as IssueInsert);
  }

  console.log("Issues created");
};
const main = async () => {
  await db.transaction(async (tx) => {
    const { adminRoleId } = await setupRolesAndPermissions(tx);

    const { userId, organizationId } = await setupUserAndOrganization(
      tx,
      adminRoleId,
    );

    await setupIssues(tx, userId, organizationId);
  });
};

main().then(() => {});
