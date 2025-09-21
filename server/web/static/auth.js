var getSession = async () => {
    var session = await fetch("/auth/getsession").then((res) => res.json());
    return session;
}

var getTenant = async () => {
    var tenant = await fetch("/auth/gettenant").then((res) => res.json());
    return tenant;
}

var getSessions = async () => {
    var sessions = await fetch("/auth/getsessions").then((res) => res.json());
    return sessions;
}