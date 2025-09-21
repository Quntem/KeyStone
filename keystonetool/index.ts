import inquirer from "inquirer";
import fs from "node:fs/promises";
import { viewUsers } from "./viewusers.ts";

var config = {
    token: "",
    url: "http://localhost:7045",
}

try {
    config = JSON.parse(await fs.readFile("./config.json", "utf-8"));
} catch (e) {
    console.log("Config file not found, creating default config");
    config = {
        token: "",
        url: "http://localhost:7045",
    }
    await fs.writeFile("./config.json", JSON.stringify(config));
}

if (!config.token || config.token == "") {
    await inquirer
        .prompt([
            {
                type: "input",
                name: "Username",
                message: "Enter your username",
            },
            {
                type: "password",
                name: "Password",
                message: "Enter your password",
            },
        ])
        .then(async (answers) => {
            var response = await fetch(config.url + "/auth/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                redirect: "manual",
                body: new URLSearchParams({
                    username: answers.Username,
                    password: answers.Password,
                }),
            });
            if (response.status == 302) {
                config.token = response.headers.get("Set-Cookie")?.split(";")[0].split("=")[1] || "";
                console.log("Successfully signed in");
                if (config.token == "") {
                    console.log("Failed to get token");
                    return;
                }
                await fs.writeFile("./config.json", JSON.stringify(config));
            } else {
                console.log("Failed to sign in");
                console.log(response);
            }
        });
}

inquirer
    .prompt([
        {
            type: "list",
            name: "toolname",
            message: "Select a tool",
            choices: [
                "Sign out",
                "View Users",
                "Create Tenant",
                "Create User",
                "Create App",
            ],
        },
    ])
    .then((answers) => {
        switch (answers.toolname) {
            case "Sign out":
                config.token = "";
                break;
            case "View Users":
                viewUsers({config}).then((users) => {
                    console.log(users);
                });
            case "Create Tenant":
                break;
            case "Create User":
                break;
            case "Create App":
                break;
        }
    });
