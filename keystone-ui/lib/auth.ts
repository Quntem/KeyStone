import { useEffect, useState } from "react";

export function useSession() {
    const reload = () => {
        setSession({data: null, loaded: false, reload});
    };
    const [session, setSession] = useState({data: null, loaded: false, reload});
    useEffect(() => {
        if (!session.loaded) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/getsession", {credentials: "include", redirect: "manual"}).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    console.log("unauthorized");
                    return {user: null, tenant: null, error: {
                        text: "Unauthorized",
                        code: "Unauthorized",
                        status: 401,
                    }}
                }
            }).then((data) => {
                setSession({data, loaded: true, reload});
            });
        }
    }, [session.loaded]);
    return session;
}

export function useSessionList() {
    const reload = () => {
        setSession({data: null, loaded: false, reload});
    };
    const [session, setSession] = useState({data: null, loaded: false, reload});
    useEffect(() => {
        if (!session.loaded) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/getsessions", {credentials: "include", redirect: "manual"}).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    console.log("unauthorized");
                    return {error: {
                        text: "Unauthorized",
                        code: "Unauthorized",
                        status: 401,
                    }}
                }
            }).then((data) => {
                setSession({data, loaded: true, reload});
            });
        }
    }, [session.loaded]);
    return session;
}

export function useTenant() {
    const reload = () => {
        setTenant({data: null, loaded: false, reload});
    };
    const [tenant, setTenant] = useState({data: null, loaded: false, reload});
    useEffect(() => {
        if (!tenant.loaded) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/gettenant", {credentials: "include", redirect: "manual"}).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    console.log("unauthorized");
                    return {tenant: null, error: {
                        text: "Unauthorized",
                        code: "Unauthorized",
                        status: 401,
                    }}
                }
            }).then((data) => {
                setTenant({data: {tenant: data}, loaded: true, reload});
            });
        }
    }, [tenant.loaded]);
    return tenant;
}

export async function LogOut() {
    return await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/logout", {credentials: "include", redirect: "manual"}).then(res => res.text())
}

export async function deleteSession(sessionId: string) {
    return await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/deletesession", {
        credentials: "include", 
        redirect: "manual", 
        method: "POST", 
        body: JSON.stringify({sessionId}),
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
    }).then(res => res.text())
}
