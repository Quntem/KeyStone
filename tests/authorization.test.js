import assert from "node:assert/strict";
import test from "node:test";
import { hasRequiredRole } from "../authorization.ts";

test("tenantless admins cannot enter tenant administration", () => {
    assert.equal(hasRequiredRole({ role: "ADMIN", tenantId: null }, "ADMIN"), false);
});

test("tenant admins retain administrative access", () => {
    assert.equal(hasRequiredRole({ role: "ADMIN", tenantId: "tenant-1" }, "ADMIN"), true);
});

test("non-admin users cannot enter tenant administration", () => {
    assert.equal(hasRequiredRole({ role: "USER", tenantId: null }, "ADMIN"), false);
});
