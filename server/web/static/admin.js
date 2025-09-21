async function getUsers() {
    var users = await fetch("/admin/users").then((res) => res.json());
    return users;
}

async function getUserById(id) {
    var user = await fetch("/admin/user/" + id + "/get").then((res) => res.json());
    return user;
}

