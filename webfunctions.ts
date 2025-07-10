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
            if (redirectTo) {
                return res.redirect(redirectTo + (redirectTo.includes("?") ? "&" : "?") + "redirectTo=" + encodeURIComponent(req.url));
            } else {
                return res.status(401).json({ message: "Unauthorized" });
            }
        } else {
            var session = await getSession({sessionId: req.cookies.sessionId});
            if (!session) {
                if (redirectTo) {
                    return res.redirect(redirectTo + (redirectTo.includes("?") ? "&" : "?") + "redirectTo=" + encodeURIComponent(req.url));
                } else {
                    return res.status(401).json({ message: "Unauthorized" });
                }
            }
            req.auth = await getUserById({id: session.userId});
        }
        next();
    }
}