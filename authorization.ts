export function hasRequiredRole(user: { role?: string; tenantId?: string | null } | undefined, role: string) {
    return user?.role === role && (role !== "ADMIN" || Boolean(user.tenantId));
}
