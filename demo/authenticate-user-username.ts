import { validateUser, getUserIdByUsername, getTenantByName } from "../functions.ts";

import * as readline from 'node:readline/promises';

import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({
    input: input,
    output: output,
});

var username = await rl.question("Username: ");
const password = await rl.question("Password: ");
var tenantName = username.split("/")[0];
username = username.split("/")[1];
const tenant = await getTenantByName({name: tenantName});
if (!tenant) {
    throw new Error("Tenant not found");
}
const userId = await getUserIdByUsername({tenantId: tenant.id, username});
if (!userId) {
    throw new Error("User not found");
}
validateUser({userId: userId.id, password});

rl.close();
