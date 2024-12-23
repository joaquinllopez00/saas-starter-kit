import "dotenv/config";
import enquirer from "enquirer";
import {
  db,
  PermissionsTable,
  RolesTable,
  RolesToPermissionsTable,
} from "../app/drizzle/schema";
import type { Permission, Role } from "../app/services/db/types";

let ENTITIES = ["issues", "members", "settings"];
const ACTIONS = ["read", "write"];
const ACCESS_TYPES = ["any", "own", "team", "organization"];

const getExistingPermissions = async (tx): Promise<Permission[]> => {
  return await tx.select().from(PermissionsTable).execute();
};

const promptForNewEntity = async () => {
  const { newEntity } = await enquirer.prompt({
    type: "input",
    name: "newEntity",
    message: "Enter the name of the new entity:",
    validate: (input) => input.trim() !== "" || "Entity name cannot be empty",
  });
  ENTITIES.push(newEntity);
  console.log(`Added new entity: ${newEntity}`);
  return newEntity;
};

const promptForEntitySelection = async () => {
  const { entityChoice } = await enquirer.prompt({
    type: "select",
    name: "entityChoice",
    message: "Select the entity for this permission:",
    choices: [...ENTITIES, "Add new entity"],
  });

  if (entityChoice === "Add new entity") {
    return await promptForNewEntity();
  }
  return entityChoice;
};

const promptForPermission = async () => {
  const entity = await promptForEntitySelection();
  const { action, access, description } = await enquirer.prompt<{
    action: string;
    access: string;
    description: string;
  }>([
    {
      type: "select",
      name: "action",
      message: "Select the action for this permission:",
      choices: ACTIONS,
    },
    {
      type: "select",
      name: "access",
      message: "Select the access type for this permission:",
      choices: ACCESS_TYPES,
    },
    {
      type: "input",
      name: "description",
      message: "Enter a description for this permission:",
      validate: (input) => input.trim() !== "" || "Description cannot be empty",
    },
  ]);

  return { entity, action, access, description };
};

// @ts-expect-error
const addCustomRole = async (tx) => {
  console.log("Adding a new custom role...");

  const roleDetails = await enquirer.prompt<{
    name: string;
    displayName: string;
    description: string;
  }>([
    {
      type: "input",
      name: "name",
      message: "Enter the role name:",
      validate: (input) => input.trim() !== "" || "Role name cannot be empty",
    },
    {
      type: "input",
      name: "displayName",
      message: "Enter the display name for the role:",
      validate: (input) =>
        input.trim() !== "" || "Display name cannot be empty",
    },
    {
      type: "input",
      name: "description",
      message: "Enter a description for the role:",
      validate: (input) => input.trim() !== "" || "Description cannot be empty",
    },
  ]);

  await tx.insert(RolesTable).values(roleDetails).returning();

  console.log(`Role '${roleDetails.name}' created. Now adding permissions...`);
};

const promptForPermissionChoice = async (existingPermissions: Permission[]) => {
  const { permissionChoice } = await enquirer.prompt<{
    permissionChoice: string;
  }>({
    type: "select",
    name: "permissionChoice",
    message: "Do you want to add an existing permission or create a new one?",
    choices: ["Add existing permission", "Create new permission"],
  });

  if (permissionChoice === "Add existing permission") {
    const { permissionIds } = await enquirer.prompt<{
      permissionIds: number[];
    }>({
      type: "multiselect",
      name: "permissionId",
      message: "Select the permissions you want to add to this role:",
      choices: existingPermissions.map((permission) => ({
        name: `${permission.entity} - ${permission.action} - ${permission.access}`,
        value: permission.id,
      })),
    });
    // return { type: "existing", permissionId };
  } else {
    const newPermission = await promptForPermission();
    return { type: "new", permission: newPermission };
  }
};

// @ts-expect-error
const addPermissionsToRole = async (tx, roleId: number) => {
  let addMorePermissions = true;
  const existingPermissions = await getExistingPermissions(tx);

  while (addMorePermissions) {
    const permissionChoice =
      await promptForPermissionChoice(existingPermissions);

    if (permissionChoice.type === "existing") {
      await tx.insert(RolesToPermissionsTable).values({
        roleId,
        permissionId: permissionChoice.permissionId,
      });
      console.log(`Added existing permission to role.`);
    } else {
      const newPermission = await tx
        .insert(PermissionsTable)
        .values(permissionChoice.permission)
        .returning();
      await tx.insert(RolesToPermissionsTable).values({
        roleId,
        permissionId: newPermission[0].id,
      });
      console.log(`Created and added new permission to role.`);
    }

    const { shouldContinue } = await enquirer.prompt<{
      shouldContinue: boolean;
    }>({
      type: "confirm",
      name: "shouldContinue",
      message: "Do you want to add another permission to this role?",
      initial: true,
    });

    addMorePermissions = shouldContinue;
  }
};

// @ts-ignore
const modifyExistingRole = async (tx) => {
  const roles: Role[] = await tx.select().from(RolesTable).execute();

  const { roleId } = await enquirer.prompt<{ roleId: number }>({
    type: "select",
    name: "roleId",
    message: "Select the role you want to modify:",
    choices: roles.map((role) => ({ name: role.displayName, value: role.id })),
  });
  console.log(`Adding permissions to role with ID: ${roleId}`);
  await addPermissionsToRole(tx, roleId);
};

const main = async () => {
  await db.transaction(async (tx) => {
    const { action } = await enquirer.prompt<{ action: string }>({
      type: "select",
      name: "action",
      message: "What would you like to do?",
      choices: ["Add new role", "Modify existing role"],
      initial: 0,
    });

    console.log("Selected action:", action);
    if (action === "Add new role") {
      await addCustomRole(tx);
    } else {
      await modifyExistingRole(tx);
    }
  });
};

main().catch(console.error);
