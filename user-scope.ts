export function tenantUsernameFilter(tenantId: string | null | undefined, username: string) {
    return tenantId ? { tenantId, username } : null;
}
