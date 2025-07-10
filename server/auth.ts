import express from "express";
import { createSession, getUserIdByUsername, getTenantByName } from "../functions.ts";
import bodyParser from "body-parser";
import { requireAuth } from "../webfunctions.ts";

var router = express.Router();

router.get("/signin", async (req: any, res: any) => {
    if (req.cookies?.sessionId) {
        res.redirect(req.query.redirectTo || "/ui/showsessiontoken");
        return;
    }
    res.sendFile("./auth/signin.html", { root: process.cwd() + "/UI" });
});

router.post("/signin", bodyParser.urlencoded({ extended: true }), async (req: any, res: any) => {
    var tenantName = req.body.username.split("/")[0];
    var username = req.body.username.split("/")[1];
    var tenant = await getTenantByName({name: tenantName});
    if (!tenant) {
        res.redirect("/auth/signin");
        return;
    }
    var userId = await getUserIdByUsername({tenantId: tenant.id, username});
    if (!userId) {
        res.redirect("/auth/signin");
        return;
    }
    var session = await createSession({userId: userId.id, password: req.body.password});
    res.cookie("sessionId", session.id);
    res.redirect(req.body.redirectTo || "/auth/ui/showsessiontoken");
});

router.get("/ui/showsessiontoken", requireAuth({redirectTo: "/auth/signin"}), async (req: any, res: any) => {
    res.sendFile("./auth/showsessiontoken.html", { root: process.cwd() + "/UI" });
});

router.get("/logout", requireAuth({redirectTo: "/auth/signin"}), async (req: any, res: any) => {
    res.cookie("sessionId", "", { expires: new Date(0) });
    res.redirect(req.query.redirectTo || "/auth/signin");
});

export {router}
