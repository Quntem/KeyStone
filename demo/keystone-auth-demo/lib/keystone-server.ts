export function VerifySession({appId, keystoneUrl, sessionId, appSecret}: {appId: string, keystoneUrl: string, sessionId: string, appSecret: string}) {
    return new Promise((resolve, reject) => {
        const headers = new Headers();
        headers.set("Authorization", "Bearer " + appSecret);
        headers.set("x-app-id", appId);
        fetch(keystoneUrl + "/app/verifysession?sessionId=" + sessionId, {
            method: "POST",
            credentials: "include",
            redirect: "manual",
            headers,
        }).then((res) => res.json()).then((data) => {
            if (data.error) {
                reject(data.error);
            }
            resolve({
                sessionId: data.id,
                userAppAccessId: data.userAppAccessId,
                app: data.userAppAccess.app,
                user: data.userAppAccess.user,
                tenant: data.userAppAccess.user.tenant,
                createdAt: data.createdAt,
            });
        });
    });
}