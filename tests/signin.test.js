import assert from "node:assert/strict";
import test from "node:test";
import { createSignInHandler } from "../server/signin.ts";

function createResponse() {
    return {
        headers: {},
        clearCookieCall: undefined,
        redirectTo: undefined,
        signInPageSent: false,
        setHeader(name, value) {
            this.headers[name] = value;
        },
        clearCookie(...args) {
            this.clearCookieCall = args;
        },
        redirect(location) {
            this.redirectTo = location;
        },
        sendFile() {
            this.signInPageSent = true;
        },
    };
}

test("an invalid session cookie is cleared and the sign-in page is shown", async () => {
    const sessionCookieOptions = { sameSite: "none", secure: true };
    const response = createResponse();
    const handler = createSignInHandler({
        getSession: async ({ sessionId }) => {
            assert.equal(sessionId, "expired-session");
            return undefined;
        },
        sessionCookieOptions,
        sendSignInPage: (res) => res.sendFile(),
    });

    await handler({ cookies: { sessionId: "expired-session" }, query: { redirectTo: "/protected" } }, response);

    assert.deepEqual(response.clearCookieCall, ["sessionId", sessionCookieOptions]);
    assert.equal(response.signInPageSent, true);
    assert.equal(response.redirectTo, undefined);
    assert.equal(response.headers["Cache-Control"], "no-store, no-cache, must-revalidate, proxy-revalidate");
});

test("a valid session cookie continues to the requested destination", async () => {
    const response = createResponse();
    const handler = createSignInHandler({
        getSession: async () => ({ id: "valid-session" }),
        sessionCookieOptions: {},
        sendSignInPage: (res) => res.sendFile(),
    });

    await handler({ cookies: { sessionId: "valid-session" }, query: { redirectTo: "/protected?tab=one" } }, response);

    assert.equal(response.redirectTo, "/protected?tab=one");
    assert.equal(response.clearCookieCall, undefined);
    assert.equal(response.signInPageSent, false);
});

test("a missing session cookie shows the sign-in page without looking up a session", async () => {
    const response = createResponse();
    const handler = createSignInHandler({
        getSession: async () => assert.fail("should not look up a missing session"),
        sessionCookieOptions: {},
        sendSignInPage: (res) => res.sendFile(),
    });

    await handler({ cookies: {}, query: {} }, response);

    assert.equal(response.signInPageSent, true);
    assert.equal(response.clearCookieCall, undefined);
    assert.equal(response.redirectTo, undefined);
});
