import express from "express";
import { getUserIdByUsername, createSession, getTenantByName, getSession, getUserById, listSessions, deleteSession, listTenantUsers } from "../functions.ts";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

var app = express();
app.use(cookieParser());

app.get("/signin", async (req, res) => {
    if (req.cookies?.sessionId) {
        res.redirect("/");
    }
    res.sendFile("./public/signin.html", { root: process.cwd() + "/web" });
});

app.get("/", async (req, res) => {
    if (!req.cookies?.sessionId) {
        res.redirect("/signin");
        return;
    }
    var session = await getSession({sessionId: req.cookies.sessionId});
    if (!session) {
        res.redirect("/signin");
        return;
    }
    res.sendFile("./index.html", { root: process.cwd() + "/web" });
});

app.get("/me", async (req, res) => {
    if (!req.cookies?.sessionId) {
        res.redirect("/signin");
        return;
    }
    var session = await getSession({sessionId: req.cookies.sessionId});
    if (!session) {
        res.redirect("/signin");
        return;
    }
    var user = await getUserById({id: session.userId});
    res.json(user);
});

app.delete("/session/:sessionId", async (req, res) => {
    if (!req.cookies?.sessionId) {
        res.redirect("/signin");
        return;
    }
    if (req.cookies.sessionId == req.params.sessionId) {
        res.cookie("sessionId", "", { expires: new Date(0) });
    }
    await deleteSession({sessionId: req.params.sessionId});
    res.redirect("/signin");
});

app.post("/signin", bodyParser.urlencoded({ extended: true }), async (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.redirect("/signin");
        return;
    }
    var tenantName = req.body.username.split("/")[0];
    var username = req.body.username.split("/")[1];
    var tenant = await getTenantByName({name: tenantName});
    if (!tenant) {
        res.redirect("/signin");
        return;
    }
    var userId = await getUserIdByUsername({tenantId: tenant.id, username});
    console.log(userId);
    if (!userId) {
        res.redirect("/signin");
        return;
    }
    var session = await createSession({userId: userId.id, password: req.body.password});
    res.cookie("sessionId", session.id);
    res.redirect("/");
});

app.get("/sessions", async (req, res) => {
    if (!req.cookies?.sessionId) {
        res.redirect("/signin");
        return;
    }
    var session = await getSession({sessionId: req.cookies.sessionId});
    if (!session) {
        res.redirect("/signin");
        return;
    }
    var sessions = await listSessions({userId: session.userId});
    res.json(sessions);
});

app.get("/admin/api/users", async (req, res) => {
    if (!req.cookies?.sessionId) {
        res.redirect("/signin");
        return;
    }
    var session = await getSession({sessionId: req.cookies.sessionId});
    if (!session) {
        res.redirect("/signin");
        return;
    }
    var user = await getUserById({id: session.userId});
    if (!user || user.role != "ADMIN") {
        res.redirect("/");
        return;
    }
    var users = await listTenantUsers({tenantId: user.tenantId});
    res.json(users);
});

app.get("/admin/api/user/:id", async (req, res) => {
    if (!req.cookies?.sessionId) {
        res.redirect("/signin");
        return;
    }
    var session = await getSession({sessionId: req.cookies.sessionId});
    if (!session) {
        res.redirect("/signin");
        return;
    }
    var user = await getUserById({id: session.userId});
    if (!user || user.role != "ADMIN") {
        res.redirect("/");
        return;
    }
    var user = await getUserById({id: req.params.id});
    res.json(user);
});

app.get("/admin/ui/*path", async (req, res) => {
    if (!req.cookies?.sessionId) {
        res.redirect("/signin");
        return;
    }
    var session = await getSession({sessionId: req.cookies.sessionId});
    if (!session) {
        res.redirect("/signin");
        return;
    }
    var user = await getUserById({id: session.userId});
    if (!user || user.role != "ADMIN") {
        res.redirect("/");
        return;
    }
    res.sendFile("./" + req.params.path.join("/"), { root: process.cwd() + "/web/admin" });
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});