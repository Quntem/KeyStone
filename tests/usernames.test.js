import assert from "node:assert/strict";
import test from "node:test";
import { personalUsernameFromEmail } from "../usernames.ts";

test("personal usernames distinguish emails that collided under separator replacement", () => {
    const first = personalUsernameFromEmail("jane.doe@example.com");
    const second = personalUsernameFromEmail("jane_doe@example.com");

    assert.equal(first, "jane_ddoe_aexample_dcom");
    assert.equal(second, "jane_udoe_aexample_dcom");
    assert.notEqual(first, second);
    assert.doesNotMatch(first, /[@.]/);
    assert.doesNotMatch(second, /[@.]/);
});

test("personal username encoding keeps underscores distinct from email separators", () => {
    assert.notEqual(
        personalUsernameFromEmail("a_b@example.com"),
        personalUsernameFromEmail("a.b@example.com"),
    );
});
