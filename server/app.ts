import express from "express";
import { createAppSession, getAppById, getAppSessionToken, getAppSessionTokenById, getSession } from "../functions.ts";
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

router.post("/app/:appId/verifySession", express.json(), async (req: any, res: any) => {
    const app = await getAppById({id: req.params.appId});
    if (!app || app.secret != req.headers["authorization"]?.split(" ")[1]) {
        res.status(401).json({error: "Not Valid"});
        return;
    }
    const session = await getAppSessionTokenById({id: req.body.sessionId});
    if (!session) {
        res.status(401).json({error: "Not Valid"});
        return;
    }
    res.json(session);
});

export {router}
    