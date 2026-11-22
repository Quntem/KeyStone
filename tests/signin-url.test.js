import assert from "node:assert/strict";
import test from "node:test";
import { buildSignInUrl } from "../keystone-ui/lib/signin-url.ts";

test("sign-in URL preserves the full return URL, including query and hash", () => {
    const redirectTo = "https://app.example.test/private?a=1&b=two words#section";
    const signInUrl = new URL(buildSignInUrl("https://keystone.example.test/", redirectTo));

    assert.equal(signInUrl.origin, "https://keystone.example.test");
    assert.equal(signInUrl.pathname, "/auth/signin");
    assert.equal(signInUrl.searchParams.get("redirectTo"), redirectTo);
    assert.equal([...signInUrl.searchParams.keys()].length, 1);
});

test("sign-in URL can be built without an API base URL", () => {
    assert.equal(
        buildSignInUrl(undefined, "https://app.example.test/private?x=1&y=2"),
        "/auth/signin?redirectTo=https%3A%2F%2Fapp.example.test%2Fprivate%3Fx%3D1%26y%3D2",
    );
});
