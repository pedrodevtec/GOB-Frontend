import type {
  AccountRole,
  AuthUser,
  Table,
  TableMemberStatus,
  TableRole
} from "@/types/app";

export function normalizeAccountRole(value: unknown): AccountRole {
  return String(value ?? "").toUpperCase() === "ADMIN" ? "ADMIN" : "USER";
}

export function accountRoleFor(user?: Partial<AuthUser> | null): AccountRole {
  return normalizeAccountRole(user?.accountRole ?? user?.systemRole ?? user?.role);
}

export function tableRoleFor(table?: Pick<Table, "currentUserRole" | "isMaster"> | null) {
  if (table?.isMaster === true) return "MASTER";

  const role = String(table?.currentUserRole ?? "").toUpperCase();
  return role === "MASTER" || role === "PLAYER" ? (role as TableRole) : null;
}

export function tableMemberStatusFor(
  table?: Pick<Table, "memberStatus"> | null
): TableMemberStatus | null {
  const status = String(table?.memberStatus ?? "").toUpperCase();
  return status === "ACTIVE" || status === "INVITED" || status === "REMOVED"
    ? status
    : null;
}

export function canAccessMasterPanel(table?: Pick<Table, "currentUserRole" | "isMaster"> | null) {
  return table?.isMaster === true || tableRoleFor(table) === "MASTER";
}

export function canAccessPlayerArea(
  table?: Pick<Table, "currentUserRole" | "isMaster" | "memberStatus"> | null
) {
  return tableRoleFor(table) === "PLAYER" || tableMemberStatusFor(table) === "ACTIVE";
}
