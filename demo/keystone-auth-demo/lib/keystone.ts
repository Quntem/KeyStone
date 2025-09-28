import { useEffect, useState } from "react";

export function useAuth({appId, keystoneUrl}: {appId: string, keystoneUrl: string}) {
    const [data, setData] = useState({
        data: undefined,
        loaded: false,
        error: null,
    });

    useEffect(() => {
        const headers = new Headers();
        headers.set("x-app-id", appId);
        const fetchUser = async () => {
            try {
                const data = await fetch(keystoneUrl + "/app/getSessionToken", {
                    method: "GET",
                    credentials: "include",
                    redirect: "manual",
                    headers,
                }).then((res) => res.json());
                setData({
                    data: {
                        sessionId: data.id,
                        userAppAccessId: data.userAppAccessId,
                        app: data.userAppAccess.app,
                        user: data.userAppAccess.user,
                        tenant: data.userAppAccess.user.tenant,
                        createdAt: data.createdAt,
                    },
                    loaded: true,
                    error: null,
                });
            } catch (error) {
                setData({
                    data: undefined,
                    loaded: true,
                    error,
                });
            }
        };
        fetchUser();
    }, []);

    return data;
}

export function getAuth({appId, keystoneUrl}: {appId: string, keystoneUrl: string}) {
    const headers = new Headers();
    headers.set("x-app-id", appId);
    const fetchUser = async () => {
        try {
            const user = await fetch(keystoneUrl + "/app/getSessionToken", {
                method: "GET",
                credentials: "include",
                redirect: "manual",
                headers,
            }).then((res) => res.json());
            return user;
        } catch (error) {
            return null;
        }
    };
    return fetchUser();
}