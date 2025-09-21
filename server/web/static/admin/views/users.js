var users = [];

getSession().then((session) => {
    getTenant().then((tenant) => {
        document.getElementById("appheader-title").innerHTML = "Users in " + tenant.name;
        document.getElementById("filterbutton").onclick = filterUsers;
        getUsers().then((userslist) => {
            users = userslist;
            document.getElementById("userlist").innerHTML = renderUsers(users);
        });
    });
});

function UserItem(user) {
    return `<div class="listitem" onclick="goToUser('${user.id}')">
        <div style="height: 20px;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-round"><circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path></svg></div>
        <div>${user.name} (${user.tenant.name}/${user.username}) • ${user.role} • ${user.email}</div>
    </div>`;
}

function renderUsers(users) {
    var html = "";
    for (var user of users) {
        html += UserItem(user);
    }
    return html;
}

function filterUsers() {
    var search = document.getElementById("usersearch").value;
    var role = document.getElementById("userrolefilter").value;
    var filteredUsers = users.filter((user) => {
        return user.name.toLowerCase().includes(search.toLowerCase()) && (role != "" ? user.role == role : true);
    });
    document.getElementById("userlist").innerHTML = renderUsers(filteredUsers);
}

document.goToUser = (id) => {
    window.history.pushState(null, null, "/app/admin/usermanage/" + id);
    handleNav();
}