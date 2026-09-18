import type { Prisma } from "@/generated/prisma/client";
import { ConflictError } from "@/modules/auth/errors";

export async function assertSecurityAdministratorRemains(
  tx: Prisma.TransactionClient,
): Promise<void> {
  const activeUsers = await tx.user.findMany({
    where: { isActive: true },
    select: {
      roles: {
        select: {
          role: {
            select: {
              isActive: true,
              permissions: {
                select: {
                  permissionKey: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const hasSecurityAdministrator = activeUsers.some((user) =>
    user.roles.some(
      ({ role }) =>
        role.isActive &&
        role.permissions.some(
          ({ permissionKey }) => permissionKey === "roles.manage",
        ),
    ),
  );

  if (!hasSecurityAdministrator) {
    throw new ConflictError(
      "El cambio dejaría al sistema sin ningún usuario activo con permiso roles.manage.",
    );
  }
}
