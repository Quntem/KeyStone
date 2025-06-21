import { createTenant } from "../functions.ts";

import * as readline from 'node:readline/promises';

import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({
    input: input,
    output: output,
});

const name = await rl.question("Name: ");

const tenant = await createTenant({name});

console.log(tenant);

rl.close();
