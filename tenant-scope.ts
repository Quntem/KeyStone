export function tenantIdFilter(tenantId: string | null | undefined) {
    return { tenantId: tenantId ?? null };
}
