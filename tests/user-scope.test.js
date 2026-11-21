import assert from "node:assert/strict";
import test from "node:test";
import { tenantUsernameFilter } from "../user-scope.ts";

test("tenant user lookups remain scoped to the supplied tenant", () => {
    assert.deepEqual(tenantUsernameFilter("tenant-1", "jane"), { tenantId: "tenant-1", username: "jane" });
});

test("personal users skip tenant-scoped username uniqueness checks", () => {
    assert.equal(tenantUsernameFilter(undefined, "jane_doe_example_com"), null);
    assert.equal(tenantUsernameFilter(null, "jane_doe_example_com"), null);
});
