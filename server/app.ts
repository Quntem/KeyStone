import express from "express";
import { getAppSessionById, getAppSessionToken } from "../functions.ts";
import { appAuth, requireAuth } from "../webfunctions.ts";
import cors from "cors";

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
        res.status(404).json({error: "App not found"});
        return;
    }
    try {
        const session = await getAppSessionToken({appId: app.id, userId: req.auth.id, sessionId: req.cookies.sessionId});
        if (!session) {
            res.status(401).json({error: "unauthorized"});
            return;
        }
        console.log(session)
        res.json(session);
    } catch (error) {
        console.log(error);
        res.status(401).json({error: "unauthorized"});
        return;
    }
});

router.post("/verifysession", async (req: any, res: any) => {
    const app = req.app
    if (!app || app.secret != req.headers["Authorization"]?.split(" ")[1]) {
        console.log(app.secret != req.headers["Authorization"]?.split(" ")[1] ? "Invalid secret" : "Invalid app")
        res.status(401).json({error: "Not Valid"});
        return;
    }
    console.log(req.query.sessionId)
    const session = await getAppSessionById({id: req.query.sessionId as string});
    console.log(session)
    if (!session) {
        console.log("Invalid session");
        res.status(401).json({error: "Not Valid"});
        return;
    }
    res.json(session);
});

export {router}
    