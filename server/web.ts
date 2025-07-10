import express from "express";
import { getSession } from "../functions.ts";

var router = express.Router();

router.get("/", async (req: any, res: any) => {
    if (!req.cookies?.sessionId) {
        res.redirect("/auth/signin");
        return;
    }
    var session = await getSession({sessionId: req.cookies.sessionId});
    if (!session) {
        res.redirect("/auth/signin");
        return;
    }
    res.sendFile("/home/index.html", { root: process.cwd() + "/server/web" });
});

export {router}
