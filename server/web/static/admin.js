async function getUsers() {
    var users = await fetch("/admin/users").then((res) => res.json());
    return users;
}
