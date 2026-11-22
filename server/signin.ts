type SignInHandlerOptions = {
    getSession: ({ sessionId }: { sessionId: string }) => Promise<unknown>;
    sessionCookieOptions: Record<string, unknown>;
    sendSignInPage: (res: any) => unknown;
};

export function createSignInHandler({ getSession, sessionCookieOptions, sendSignInPage }: SignInHandlerOptions) {
    return async (req: any, res: any) => {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        const sessionId = req.cookies?.sessionId;
        if (sessionId) {
            const session = await getSession({ sessionId });
            if (session) {
                res.redirect(req.query.redirectTo || "/auth/ui/showsessiontoken");
                return;
            }
            res.clearCookie("sessionId", sessionCookieOptions);
        }

        sendSignInPage(res);
    };
}
