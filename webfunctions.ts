import express from "express";
import { getSession, getUserById } from "./functions.ts";

export function requireRole(role: string) {
    return (req: any, res: any, next: any) => {
        if (!req.cookies?.sessionId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        next();
    };
}

export function requireAuth({redirectTo}: {redirectTo: string}) {
    return async (req: any, res: any, next: any) => {
        if (!req.cookies?.sessionId) {
            console.log("No session");
            if (redirectTo) {
                console.log(req.originalUrl)
                return res.redirect(redirectTo + (redirectTo.includes("?") ? "&" : "?") + "redirectTo=" + encodeURIComponent(req.originalUrl));
            } else {
                return res.status(401).json({ message: "Unauthorized" });
            }
        } else {
            console.log("Session found");
            var session = await getSession({sessionId: req.cookies.sessionId});
            if (!session) {
                res.cookie("sessionId", "", { expires: new Date(0) });
                console.log("Invalid session");
                if (redirectTo) {
                    console.log(req.originalUrl)
                    return res.redirect(redirectTo + (redirectTo.includes("?") ? "&" : "?") + "redirectTo=" + encodeURIComponent(req.originalUrl));
                } else {
                    return res.status(401).json({ message: "Unauthorized" });
                }
            }
            req.auth = await getUserById({id: session.userId});
        }
        next();
    }
}