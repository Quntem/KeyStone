import assert from "node:assert/strict";
import test from "node:test";
import { tenantIdFilter } from "../tenant-scope.ts";

test("tenant filters remain scoped to the supplied tenant", () => {
    assert.deepEqual(tenantIdFilter("tenant-1"), { tenantId: "tenant-1" });
});

test("tenantless users are filtered to records without a tenant", () => {
    assert.deepEqual(tenantIdFilter(undefined), { tenantId: null });
    assert.deepEqual(tenantIdFilter(null), { tenantId: null });
});
