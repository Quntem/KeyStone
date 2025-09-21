console.log("user manage");
getUserById(window.location.pathname.split("/")[4]).then((user) => {
    console.log(user);
    document.getElementById("appheader-title").innerHTML = user.name + " (" + user.tenant.name + "/" + user.username + ")";
});