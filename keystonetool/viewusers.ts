import fs from "node:fs/promises";

export async function viewUsers({config}: {config: {token: string, url: string}}) {
    try {
        var users = await fetch(config.url + "/admin/users", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + config.token,
            },
        }).then((res) => res.text());
        return users;
    } catch (e) {
        console.log(e);
    }
}