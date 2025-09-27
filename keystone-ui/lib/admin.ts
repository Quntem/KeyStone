import { useEffect, useState } from "react";

export function useUsersList() {
    const reload = () => {
        setUsersList({data: null, loaded: false, reload});
    };
    const [usersList, setUsersList] = useState({data: null, loaded: false, reload});
    useEffect(() => {
        if (!usersList.loaded) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/users", {credentials: "include", redirect: "manual"}).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    console.log("unauthorized");
                    return {users: null, error: {
                        text: "Unauthorized",
                        code: "Unauthorized",
                        status: 401,
                    }}
                }
            }).then((data) => {
                setUsersList({data: {users: data}, loaded: true, reload});
            });
        }
    }, [usersList.loaded]);
    return usersList;
}

export function useTenantsList() {
    const reload = () => {
        setUsersList({data: null, loaded: false, reload});
    };
    const [usersList, setUsersList] = useState({data: null, loaded: false, reload});
    useEffect(() => {
        if (!usersList.loaded) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/tenants", {credentials: "include", redirect: "manual"}).then((res) => {
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
                setUsersList({data: data, loaded: true, reload});
            });
        }
    }, [usersList.loaded]);
    return usersList;
}

export function createUser({name, username, email, role, tenantId, password}: {name: string, username: string, email: string, role: string, tenantId: string, password: string}) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/user", {
            credentials: "include", 
            redirect: "manual", 
            method: "POST", 
            body: JSON.stringify({name, username, email, role, tenantId, password}),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {error: {
                    text: "Failed to create user",
                    code: "Failed to create user",
                    status: 401,
                }}
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function setUserDisabled(userId: string, disabled: boolean) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/user/" + userId + "/setdisabled", {
            credentials: "include", 
            redirect: "manual", 
            method: "POST", 
            body: JSON.stringify({disabled}),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {error: {
                    text: "Failed to disable user",
                    code: "Failed to disable user",
                    status: 401,
                }}
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function setTenantLogo(logo: string) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/tenant/logo", {
            credentials: "include", 
            redirect: "manual", 
            method: "POST", 
            body: JSON.stringify({logo}),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {error: {
                    text: "Failed to set tenant logo",
                    code: "Failed to set tenant logo",
                    status: 401,
                }}
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function setTenantDescription(description: string) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/tenant/description", {
            credentials: "include", 
            redirect: "manual", 
            method: "POST", 
            body: JSON.stringify({description}),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {error: {
                    text: "Failed to set tenant description",
                    code: "Failed to set tenant description",
                    status: 401,
                }}
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function useAdminAppsList() {
    const reload = () => {
        setAppsList({data: null, loaded: false, reload});
    };
    const [appsList, setAppsList] = useState({data: null, loaded: false, reload});
    useEffect(() => {
        if (!appsList.loaded) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/apps", {credentials: "include", redirect: "manual"}).then((res) => {
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
                setAppsList({data: data, loaded: true, reload});
            });
        }
    }, [appsList.loaded]);
    return appsList;
}

export function CreateApp({name, description, logo, mainUrl}: {name: string, description: string, logo: string, mainUrl: string}) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/app", {
            credentials: "include", 
            redirect: "manual", 
            method: "POST", 
            body: JSON.stringify({name, description, logo, mainUrl}),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {error: {
                    text: "Failed to create app",
                    code: "Failed to create app",
                    status: 401,
                }}
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function AddUserToApp({userId, appId}: {userId: string, appId: string}) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/app/" + appId + "/userappaccess", {
            credentials: "include", 
            redirect: "manual", 
            method: "POST", 
            body: JSON.stringify({userId}),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {error: {
                    text: "Failed to add user to app",
                    code: "Failed to add user to app",
                    status: 401,
                }}
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function getUserByUsername(username: string) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/user/username/" + username, {credentials: "include", redirect: "manual"}).then((res) => {
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
            resolve(data);
        });
    });
}
