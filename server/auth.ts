import express from "express";
import { createSession, getUserIdByUsername, getTenantByName, getSession, getUserById, getTenantById, listSessions, deleteSession, listUserAppAccess, listAppSessions, createAppSession, getUserIdByEmail, createTenant, createUser, getDomainByName, createDomain, updateDomain, updateUser, SetUserPassword, getAppById, getUserAppAccess, getUserAppAccessByUserIdAndAppId, grantUserAppAccess } from "../functions.ts";
import bodyParser from "body-parser";
import { requireAuth } from "../webfunctions.ts";
import isEmail from "is-email";
import cors from "cors";

var router = express.Router();

router.use(cors({
    credentials: true,
    origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL_2, process.env.FRONTEND_URL_3],
}));

router.get("/signin", async (req: any, res: any) => {
    if (req.cookies?.sessionId) {
        res.redirect(req.query.redirectTo || "/auth/ui/showsessiontoken");
        return;
    }
    res.sendFile("./auth/signin.html", { root: process.cwd() + "/server/UI" });
});

router.get("/userblocked", async (req: any, res: any) => {
    res.sendFile("./auth/userblocked.html", { root: process.cwd() + "/server/UI" });
});

router.post("/signin", bodyParser.urlencoded({ extended: true }), async (req: any, res: any) => {
    if (isEmail(req.body.username)) {
        var userId = await getUserIdByEmail({ email: req.body.username });

    } else {
        var tenantName = req.body.username.split("/")[0];
        var username = req.body.username.split("/")[1];
        var tenant = await getTenantByName({ name: tenantName });
        if (!tenant) {
            res.redirect("/auth/signin");
            return;
        }
        var userId = await getUserIdByUsername({ tenantId: tenant.id, username });
    }
    if (!userId) {
        res.redirect("/auth/signin" + (req.body.redirectTo ? "?redirectTo=" + req.body.redirectTo : "") + "&error=Invalid username or password");
        return;
    }
    const user = await getUserById({ id: userId.id });
    if (!user) {
        res.redirect("/auth/signin" + (req.body.redirectTo ? "?redirectTo=" + req.body.redirectTo : "") + "&error=Invalid username or password");
        return;
    }
    if (user.disabled) {
        res.redirect("/auth/userblocked");
        return;
    }
    try {
        var session = await createSession({ userId: userId.id, password: req.body.password });
    } catch (error) {
        res.redirect("/auth/signin" + (req.body.redirectTo ? "?redirectTo=" + req.body.redirectTo : "") + "&error=Invalid username or password");
        return;
    }
    const appSessions = await listUserAppAccess({ userId: userId.id });
    for (const appSession of appSessions) {
        await createAppSession({ userAppAccessId: appSession.id, sessionId: session.id });
    }
    res.cookie("sessionId", session.id, {
        sameSite: "none",
        secure: true,
    });
    res.redirect(req.body.redirectTo || "/auth/ui/showsessiontoken");
});

router.post("/personal/acquireApp/:appId", requireAuth({ redirectTo: "/auth/signin" }), async (req: any, res: any) => {
    const app = await getAppById({ id: req.params.appId });
    const user = await getUserById({ id: req.auth.id });
    if (!app) {
        res.status(404).json({ error: "App not found" });
        return;
    }
    if (user?.tenantId) {
        res.status(401).json({ error: "Organization accounts can't personally acquire apps" });
        return;
    }
    const userAppAccess = await getUserAppAccessByUserIdAndAppId({ userId: req.auth.id, appId: app.id });
    if (userAppAccess) {
        res.status(401).json({ error: "App already acquired" });
        return;
    }
    const newUserAppAccess = await grantUserAppAccess({ userId: req.auth.id, appId: app.id });
    const appSession = await createAppSession({ userAppAccessId: newUserAppAccess.id, sessionId: req.cookies.sessionId });
    res.json(app);
})

router.get("/ui/showsessiontoken", requireAuth({ redirectTo: "/auth/signin" }), async (req: any, res: any) => {
    res.sendFile("./auth/showsessiontoken.html", { root: process.cwd() + "/server/UI" });
});

router.get("/logout", requireAuth({ redirectTo: "/auth/signin" }), async (req: any, res: any) => {
    await deleteSession({ sessionId: req.cookies.sessionId });
    res.clearCookie("sessionId", {
        sameSite: "none",
        secure: true,
    });
    res.redirect(req.query.redirectTo || "/auth/signin");
});

router.get("/tenantexists", async (req: any, res: any) => {
    var tenant = await getTenantByName({ name: req.query.tenantName });
    res.json({ exists: !!tenant });
});

router.get("/getsession", requireAuth({ redirectTo: "/auth/signin" }), async (req: any, res: any) => {
    var session = await getSession({ sessionId: req.cookies.sessionId });
    if (!session) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    res.json({
        session,
        user: await getUserById({ id: session.userId })
    });
});

router.get("/gettenant", requireAuth({ redirectTo: "/auth/signin" }), async (req: any, res: any) => {
    var session = await getSession({ sessionId: req.cookies.sessionId });
    if (!session) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    var user = await getUserById({ id: session.userId });
    if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    var tenant = await getTenantById({ id: user.tenantId });
    res.json(tenant);
});

router.post("/setuserpassword", express.json(), requireAuth({ redirectTo: "/auth/signin" }), async (req: any, res: any) => {
    try {
        var user = await SetUserPassword({ userId: req.auth.id, password: req.body.password });
        res.json(user);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.patch("/userinfo", express.json(), requireAuth({ redirectTo: "/auth/signin" }), async (req: any, res: any) => {
    try {
        var user = await updateUser({ id: req.auth.id, name: req.body.name, email: req.auth.email, username: req.auth.username, role: req.auth.role, domainId: req.auth.domainId });
        res.json(user);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.get("/getsessions", requireAuth({ redirectTo: "/auth/signin" }), async (req: any, res: any) => {
    var session = await getSession({ sessionId: req.cookies.sessionId });
    if (!session) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    var user = await getUserById({ id: session.userId });
    if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    var sessions = await listSessions({ userId: user.id });
    res.json(sessions);
});

router.post("/deletesession", requireAuth({ redirectTo: "/auth/signin" }), express.json(), async (req: any, res: any) => {
    var session = await getSession({ sessionId: req.body.sessionId });
    if (!session) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    await deleteSession({ sessionId: session.id });
    res.json({ success: true });
});

router.get("/apps", requireAuth({ redirectTo: "/auth/signin" }), async (req: any, res: any) => {
    var session = await getSession({ sessionId: req.cookies.sessionId });
    if (!session) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    var user = await getUserById({ id: session.userId });
    if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    var apps = await listUserAppAccess({ userId: user.id });
    res.json(apps);
});

router.post("/setuptenant", express.json(), async (req: any, res: any) => {
    var tenant = await createTenant({ name: req.body.tenantName.trim().toLowerCase().replaceAll(/[^a-z0-9-_]/g, ""), type: "Organization" });
    var domain = await createDomain({ name: req.body.domain, tenantId: tenant.id });
    var user = await createUser({ tenantId: tenant.id, username: req.body.username, email: req.body.email, password: req.body.password, name: req.body.name, role: "ADMIN", domainId: domain.id });
    var session = await createSession({ userId: user.id, password: req.body.password });
    await updateDomain({ id: domain.id, name: req.body.domain, creatorId: user.id, tenantId: tenant.id });
    res.cookie("sessionId", session.id, {
        sameSite: "none",
        secure: true,
    });
    res.json({ success: true });
})

router.post("/setupteam", express.json(), async (req: any, res: any) => {
    var tenant = await createTenant({ name: req.body.tenantName.trim().toLowerCase().replaceAll(/[^a-z0-9-_]/g, ""), type: "Team" });
    var user = await createUser({ tenantId: tenant.id, username: req.body.username, email: req.body.email, password: req.body.password, name: req.body.name, role: "ADMIN", domainId: undefined });
    var session = await createSession({ userId: user.id, password: req.body.password });
    res.cookie("sessionId", session.id, {
        sameSite: "none",
        secure: true,
    });
    res.json({ success: true });
})

router.post("/setuppersonal", express.json(), async (req: any, res: any) => {
    var user = await createUser({ tenantId: undefined, username: req.body.email.replaceAll("@", "_").replaceAll(".", "_"), email: req.body.email, password: req.body.password, name: req.body.name, role: "ADMIN", domainId: undefined });
    var session = await createSession({ userId: user.id, password: req.body.password });
    res.cookie("sessionId", session.id, {
        sameSite: "none",
        secure: true,
    });
    res.json({ success: true });
})

router.get("/emailexists", async (req: any, res: any) => {
    var user = await getUserIdByEmail({ email: req.query.email });
    res.json({ exists: !!user });
})

router.get("/domainexists", async (req: any, res: any) => {
    var domain = await getDomainByName({ name: req.query.domain });
    res.json({ exists: !!domain });
})

router.get("/publicapp/:appid", async (req: any, res: any) => {
    var app = await getAppById({ id: req.params.appid });
    var tenant = await getTenantById({ id: app.tenantId });
    if (!app || app.availableForExternal == false || !tenant) {
        res.status(404).json({ error: "App not found or not available for external access" });
        return;
    }
    res.json({
        app,
        tenant: {
            name: tenant.name,
            logo: tenant.logo,
            description: tenant.description,
            displayName: tenant.displayName,
        }
    });
})

export { router }
