import express from "express";

var router = express.Router();

import { listTenantUsers } from "../functions.ts";
import { requireAuth, requireRole } from "../webfunctions.ts";

router.get("/users", requireAuth({redirectTo: "/auth/signin"}), requireRole("ADMIN"), async (req: any, res: any) => {
    var users = await listTenantUsers({tenantId: req.auth.tenantId})
    res.json(users);
});

export {router}
    