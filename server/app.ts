import express from "express";
import { getAppSessionById, getAppSessionToken, listDomains, listGroups, listTenantApps, listTenantUsers } from "../functions.ts";
import { appAuth, requireAuth } from "../webfunctions.ts";
import cors from "cors";
// import { app } from "../generated/prisma/index.js";

var router = express.Router();

router.use(cors({
    allowedHeaders: ["x-app-id", "Content-Type", "Authorization"],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    origin: true
}));

router.use(appAuth());

const corsMiddleware = (req: any, callback: any) => {
    const app = req.keystoneApp;
    if (!app) {
        callback(null, false);
        return;
    }
    if (app.mainUrl != req.headers["origin"] as string) {
        callback(null, false);
        return;
    }
    callback(null, {
        origin: req.headers['origin'],
        credentials: true // Allow credentials
    });
};

router.use(cors(corsMiddleware));

router.get("/getSessionToken", requireAuth({}), async (req: any, res: any) => {
    const app = req.keystoneApp;
    if (!app) {
        res.status(404).json({ error: "App not found" });
        return;
    }
    try {
        const session = await getAppSessionToken({ appId: app.id, userId: req.auth.id, sessionId: req.cookies.sessionId });
        if (!session) {
            res.status(401).json({ error: "unauthorized" });
            return;
        }
        // console.log(session)
        res.json(session);
    } catch (error) {
        // console.log(error);
        res.status(401).json({ error: "unauthorized" });
        return;
    }
});

router.post("/verifysession", async (req: any, res: any) => {
    const app = req.app
    if (!app || app.secret != req.headers["Authorization"]?.split(" ")[1]) {
        // console.log(app.secret != req.headers["Authorization"]?.split(" ")[1] ? "Invalid secret" : "Invalid app")
        res.status(401).json({ error: "Not Valid" });
        return;
    }
    // console.log(req.query.sessionId)
    const session = await getAppSessionById({ id: req.query.sessionId as string });
    // console.log(session)
    if (!session) {
        // console.log("Invalid session");
        res.status(401).json({ error: "Not Valid" });
        return;
    }
    res.json(session);
});

router.get("/resources", requireAuth({}), async (req: any, res: any) => {
    const app = req.keystoneApp as app;
    if (!app) {
        res.status(404).json({ error: "App not found" });
        return;
    }
    try {
        const users = await listTenantUsers({ tenantId: req.auth.tenantId })
        const groups = await listGroups({ tenantId: req.auth.tenantId })
        const domains = await listDomains({ tenantId: req.auth.tenantId })
        const apps = await listTenantApps({ tenantId: req.auth.tenantId })
        res.json({
            users,
            groups,
            domains,
            apps
        });
    } catch (error) {
        // console.log(error);
        res.status(401).json({ error: "unauthorized" });
        return;
    }
});

router.post("/resources/server", async (req: any, res: any) => {
    const app = req.app as app
    if (!app || app.secret != req.headers["Authorization"]?.split(" ")[1]) {
        res.status(401).json({ error: "Not Valid" });
        return;
    }
    const users = await listTenantUsers({ tenantId: app.tenantId })
    const groups = await listGroups({ tenantId: app.tenantId })
    const domains = await listDomains({ tenantId: app.tenantId })
    const apps = await listTenantApps({ tenantId: app.tenantId })
    res.json({
        users,
        groups,
        domains,
        apps
    });
});

export { router }
