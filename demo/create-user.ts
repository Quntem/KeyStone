import { createUser } from "../functions.ts";

import * as readline from 'node:readline/promises';

import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({
    input: input,
    output: output,
});

const email = await rl.question("Email: ");
const password = await rl.question("Password: ");
const name = await rl.question("Name: ");
const tenantId = await rl.question("Tenant ID: ");
const username = await rl.question("Username: ");

createUser({email, password, name, tenantId, username});

rl.close();
