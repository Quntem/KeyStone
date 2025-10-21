import { useEffect, useState } from "react";
import { useDebounce } from 'use-debounce';

export function useSession() {
    const reload = () => {
        setSession({data: null, loaded: false, reload});
    };
    const [session, setSession] = useState<{data: {user: {name: string, username: string, email: string, role: string, tenant: {name: string, id: string}}, tenant: {name: string, id: string}}, loaded: boolean, reload: () => void} | {data: null, loaded: boolean, reload: () => void}>({data: null, loaded: false, reload});
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

export function UseUserAppAccess() {
    const reload = () => {
        setUserAppAccess({data: null, loaded: false, reload});
    };
    const [userAppAccess, setUserAppAccess] = useState({data: null, loaded: false, reload});
    useEffect(() => {
        if (!userAppAccess.loaded) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/apps", {credentials: "include", redirect: "manual"}).then((res) => {
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
                setUserAppAccess({data: data, loaded: true, reload});
            });
        }
    }, [userAppAccess.loaded]);
    return userAppAccess;
}

export function useEmailExists(email: string) {
    const [value] = useDebounce(email, 500);
    const [emailExists, setEmailExists] = useState(false);
    useEffect(() => {
        if (value) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/emailexists?email=" + value).then((res) => {
                return res.json();
            }).then((data) => {
                setEmailExists(data.exists);
            });
        }
    }, [value]);
    return emailExists;
}

export function usePublicApp(appid: string) {
    const [publicApp, setPublicApp] = useState({loaded: false, data: {
        app: null,
        tenant: null,
    }});
    useEffect(() => {
        if (appid) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/publicapp/" + appid).then((res) => {
                return res.json();
            }).then((data) => {
                setPublicApp({loaded: true, data});
            });
        }
    }, [appid]);
    return publicApp;
}

export function useTenantExists(name: string) {
    const [value] = useDebounce(name, 500);
    const [tenantExists, setTenantExists] = useState(false);
    useEffect(() => {
        if (value) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/tenantexists?tenantName=" + value).then((res) => {
                return res.json();
            }).then((data) => {
                setTenantExists(data.exists);
            });
        }
    }, [value]);
    return tenantExists;
}

export function useDomainExists(domain: string) {
    const [value] = useDebounce(domain, 500);
    const [domainExists, setDomainExists] = useState(false);
    useEffect(() => {
        if (value) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/domainexists?domain=" + value).then((res) => {
                return res.json();
            }).then((data) => {
                setDomainExists(data.exists);
            });
        }
    }, [value]);
    return domainExists;
}

export function setDisplayName(name: string) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/userinfo", {
            credentials: "include", 
            redirect: "manual", 
            method: "PATCH", 
            body: JSON.stringify({name}),
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
        }).then(res => {
            if (res.ok) {
                resolve(res.json());
            } else {
                reject();
            }
        })
    });
}

export function setPassword(password: string) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/setuserpassword", {
            credentials: "include", 
            redirect: "manual", 
            method: "POST", 
            body: JSON.stringify({password}),
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
        }).then(res => {
            if (res.ok) {
                resolve(res.json());
            } else {
                reject();
            }
        })
    });
}