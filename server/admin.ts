import express from "express";

var router = express.Router();

import { listTenantUsers, getUserById, listChildTenants, createUser, setUserDisabled, setTenantLogo, setTenantDescription, setTenantColorContrast, setTenantColor, listTenantApps, createApp, updateApp, deleteApp, grantUserAppAccess, getUserIdByUsername } from "../functions.ts";
import { requireAuth, requireRole } from "../webfunctions.ts";

router.use(express.json());

router.get("/users", requireAuth({redirectTo: "/auth/signin"}), requireRole("ADMIN"), async (req: any, res: any) => {
    var users = await listTenantUsers({tenantId: req.auth.tenantId})
    console.log("found users");
    res.json(users);
});

router.get("/user/:id/get", requireAuth({redirectTo: "/auth/signin"}), requireRole("ADMIN"), async (req: any, res: any) => {
    var user = await getUserById({id: req.params.id});
    res.json(user);
});

router.get("/tenants", requireAuth({redirectTo: "/auth/signin"}), requireRole("ADMIN"), async (req: any, res: any) => {
    var users = await listChildTenants({tenantId: req.auth.tenantId})
    console.log("found users");
    res.json(users);
});

router.post("/user/:id/setdisabled", requireAuth({redirectTo: "/auth/signin"}), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await setUserDisabled({id: req.params.id, disabled: req.body.disabled});
        res.json({success: true});
    } catch (e) {
        console.log(e);
        res.status(400).json({error: e.message});
    }
});

router.get("/user/username/:username", requireAuth({redirectTo: "/auth/signin"}), requireRole("ADMIN"), async (req: any, res: any) => {
    var id = await getUserIdByUsername({tenantId: req.auth.tenantId, username: req.params.username});
    if (!id) {
        res.status(404).json({error: "User not found"});
        return;
    }
    var user = await getUserById({id: id.id});
    res.json(user);
});

router.post("/user", requireAuth({redirectTo: "/auth/signin"}), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var user = await createUser({email: req.body.email, password: req.body.password, name: req.body.name, tenantId: req.auth.tenantId, username: req.body.username, role: req.body.role});
        res.json(user);
    } catch (e) {
        console.log(e);
        res.status(400).json({error: e.message});
    }
});

router.post("/tenant/logo", requireAuth({redirectTo: "/auth/signin"}), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await setTenantLogo({id: req.auth.tenantId, logo: req.body.logo});
        res.json({success: true});
    } catch (e) {
        console.log(e);
        res.status(400).json({error: e.message});
    }
});

router.post("/tenant/color", requireAuth({redirectTo: "/auth/signin"}), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await setTenantColor({id: req.auth.tenantId, color: req.body.color});
        res.json({success: true});
    } catch (e) {
        console.log(e);
        res.status(400).json({error: e.message});
    }
});

router.post("/tenant/colorcontrast", requireAuth({redirectTo: "/auth/signin"}), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await setTenantColorContrast({id: req.auth.tenantId, colorContrast: req.body.colorContrast});
        res.json({success: true});
    } catch (e) {
        console.log(e);
        res.status(400).json({error: e.message});
    }
});

router.post("/tenant/description", requireAuth({redirectTo: "/auth/signin"}), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await setTenantDescription({id: req.auth.tenantId, description: req.body.description});
        res.json({success: true});
    } catch (e) {
        console.log(e);
        res.status(400).json({error: e.message});
    }
});

router.get("/apps", requireAuth({redirectTo: "/auth/signin"}), requireRole("ADMIN"), async (req: any, res: any) => {
    var apps = await listTenantApps({tenantId: req.auth.tenantId})
    console.log("found apps");
    res.json(apps);
});

router.post("/app", requireAuth({redirectTo: "/auth/signin"}), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var app = await createApp({name: req.body.name, description: req.body.description, logo: req.body.logo, allowedURLs: req.body.allowedURLs, tenantId: req.auth.tenantId, mainUrl: req.body.mainUrl});
        res.json(app);
    } catch (e) {
        console.log(e);
        res.status(400).json({error: e.message});
    }
});

router.post("/app/:id", requireAuth({redirectTo: "/auth/signin"}), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var app = await updateApp({id: req.params.id, name: req.body.name, description: req.body.description, logo: req.body.logo, allowedURLs: req.body.allowedURLs, mainUrl: req.body.mainUrl});
        res.json(app);
    } catch (e) {
        console.log(e);
        res.status(400).json({error: e.message});
    }
});

router.delete("/app/:id", requireAuth({redirectTo: "/auth/signin"}), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await deleteApp({id: req.params.id});
        res.json({success: true});
    } catch (e) {
        console.log(e);
        res.status(400).json({error: e.message});
    }
});

router.post("/app/:id/userappaccess", requireAuth({redirectTo: "/auth/signin"}), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var app = await grantUserAppAccess({userId: req.body.userId, appId: req.params.id});
        res.json(app);
    } catch (e) {
        console.log(e);
        res.status(400).json({error: e.message});
    }
});

export {router}
    