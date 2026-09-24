import type { PermissionKey } from "@/modules/auth/permissions/catalog";

export type AuthorizationRole = {
  id: string;
  name: string;
};

export type AuthorizationContext = {
  user: {
    id: string;
    username: string;
    email: string | null;
    name: string;
  };
  roles: readonly AuthorizationRole[];
  permissions: ReadonlySet<PermissionKey>;
};

export type PermissionScope = {
  stationId?: string;
};
