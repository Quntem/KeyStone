import express from "express";

var router = express.Router();

import { listTenantUsers, getUserById } from "../functions.ts";
import { requireAuth, requireRole } from "../webfunctions.ts";

router.get("/users", requireAuth({redirectTo: "/auth/signin"}), requireRole("ADMIN"), async (req: any, res: any) => {
    var users = await listTenantUsers({tenantId: req.auth.tenantId})
    console.log("found users");
    res.json(users);
});

router.get("/user/:id/get", requireAuth({redirectTo: "/auth/signin"}), requireRole("ADMIN"), async (req: any, res: any) => {
    var user = await getUserById({id: req.params.id});
    res.json(user);
});

export {router}
    