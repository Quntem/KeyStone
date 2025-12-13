import express from "express";
import { getAppSessionById, getAppSessionToken, getTenantById, listDomains, listGroups, listTenantApps, listTenantUsers } from "../functions.ts";
import { appAuth, requireAuth } from "../webfunctions.ts";
import cors from "cors";
import type { app as AppType } from "../generated/prisma/index.js";

var router = express.Router();

router.use(cors({
    allowedHeaders: ["x-app-id", "Content-Type", "Authorization"],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    origin: true
}));

router.use(appAuth());

const corsMiddleware = (req: any, callback: any) => {
    if (!req.keystoneApp) {
        callback(null, false);
        return;
    }
    if (req.keystoneApp.mainUrl != req.headers["origin"] as string) {
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
    if (!req.keystoneApp) {
        res.status(404).json({ error: "App not found" });
        return;
    }
    try {
        const session = await getAppSessionToken({ appId: req.keystoneApp.id, userId: req.auth.id, sessionId: req.cookies.sessionId });
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
    if (!req.keystoneApp || (req.keystoneApp.secret != req.headers["authorization"]?.split(" ")[1] && req.keystoneApp.secret != req.headers["Authorization"]?.split(" ")[1])) {
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
    if (!req.keystoneApp) {
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

router.get("/resources/server/:tenantId", async (req: any, res: any) => {
    if (!req.keystoneApp || (req.keystoneApp.secret != req.headers["authorization"]?.split(" ")[1] && req.keystoneApp.secret != req.headers["Authorization"]?.split(" ")[1])) {
        res.status(401).json({ error: "Not Valid" });
        return;
    }
    const tenantId = req.params.tenantId
    if (!req.keystoneApp.inExternalTenants.find((tenant) => tenant.tenantId == tenantId) && req.keystoneApp.tenantId != tenantId) {
        res.status(401).json({ error: "unauthorized" });
        return;
    }
    const tenant = await getTenantById({ id: tenantId })
    const users = await listTenantUsers({ tenantId })
    const groups = await listGroups({ tenantId })
    const domains = await listDomains({ tenantId })
    const apps = await listTenantApps({ tenantId })
    res.json({
        users,
        groups,
        domains,
        apps,
        tenant
    });
});

export { router }
