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

export function createUser({name, username, email, role, tenantId, password, domainId}: {name: string, username: string, email: string, role: string, tenantId: string, password: string, domainId: string}) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/user", {
            credentials: "include", 
            redirect: "manual", 
            method: "POST", 
            body: JSON.stringify({name, username, email, role, tenantId, password, domainId}),
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

export function setTenantDisplayName(displayName: string) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/tenant/displayname", {
            credentials: "include", 
            redirect: "manual", 
            method: "POST", 
            body: JSON.stringify({displayName}),
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
                    text: "Failed to set tenant display name",
                    code: "Failed to set tenant display name",
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

export function removeUserFromApp({accessId, appId}: {accessId: string, appId: string}) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/app/" + appId + "/userappaccess/" + accessId, {
            credentials: "include", 
            redirect: "manual", 
            method: "DELETE", 
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {error: {
                    text: "Failed to remove user from app",
                    code: "Failed to remove user from app",
                    status: 401,
                }}
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function updateUser({userId, name, username, email, role, domainId}: {userId: string, name: string, username: string, email: string, role: string, domainId: string}) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/user/" + userId, {
            credentials: "include", 
            redirect: "manual", 
            method: "PATCH", 
            body: JSON.stringify({name, username, email, role, domainId}),
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
                    text: "Failed to update user",
                    code: "Failed to update user",
                    status: 401,
                }}
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function setUserPassword({userId, password}: {userId: string, password: string}) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/user/" + userId + "/setpassword", {
            credentials: "include", 
            redirect: "manual", 
            method: "POST", 
            body: JSON.stringify({password}),
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
                    text: "Failed to update user password",
                    code: "Failed to update user password",
                    status: 401,
                }}
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function updateApp({appId, name, description, logo, mainUrl}: {appId: string, name: string, description: string, logo: string, mainUrl: string}) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/app/" + appId, {
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
                    text: "Failed to update app",
                    code: "Failed to update app",
                    status: 401,
                }}
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function createDomain({domain}: {domain: string}) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/domain", {
            credentials: "include", 
            redirect: "manual", 
            method: "POST", 
            body: JSON.stringify({domain}),
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
                    text: "Failed to create domain",
                    code: "Failed to create domain",
                    status: 401,
                }}
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function verifyDomain({domainId}: {domainId: string}) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/domain/" + domainId + "/verify", {
            credentials: "include", 
            redirect: "manual", 
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {error: {
                    text: "Failed to verify domain",
                    code: "Failed to verify domain",
                    status: 401,
                }}
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function useDomainsList() {
    const reload = () => {
        setDomainsList({data: null, loaded: false, reload});
    };
    const [domainsList, setDomainsList] = useState({data: null, loaded: false, reload});
    useEffect(() => {
        if (!domainsList.loaded) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/domains", {credentials: "include", redirect: "manual"}).then((res) => {
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
                setDomainsList({data: data, loaded: true, reload});
            });
        }
    }, [domainsList.loaded]);
    return domainsList;
}

export function useGroupsList() {
    const reload = () => {
        setGroupsList({data: null, loaded: false, reload});
    };
    const [groupsList, setGroupsList] = useState({data: null, loaded: false, reload});
    useEffect(() => {
        if (!groupsList.loaded) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/groups", {credentials: "include", redirect: "manual"}).then((res) => {
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
                setGroupsList({data: data, loaded: true, reload});
            });
        }
    }, [groupsList.loaded]);
    return groupsList;
}

export function CreateGroup({name, description, groupname}: {name: string, description: string, groupname: string}) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/group", {
            credentials: "include", 
            redirect: "manual", 
            method: "POST", 
            body: JSON.stringify({name, description, groupname}),
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
                    text: "Failed to create group",
                    code: "Failed to create group",
                    status: 401,
                }}
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function updateGroup({groupId, name, description, groupname}: {groupId: string, name: string, description: string, groupname: string}) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/group/" + groupId, {
            credentials: "include", 
            redirect: "manual", 
            method: "PATCH", 
            body: JSON.stringify({name, description, groupname}),
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
                    text: "Failed to update group",
                    code: "Failed to update group",
                    status: 401,
                }}
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function removeUserFromGroup({groupId, userId}: {groupId: string, userId: string}) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/group/" + groupId + "/user/", {
            credentials: "include", 
            redirect: "manual", 
            method: "DELETE", 
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
                    text: "Failed to remove user from group",
                    code: "Failed to remove user from group",
                    status: 401,
                }}
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function addUserToGroup({groupId, userId}: {groupId: string, userId: string}) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/group/" + groupId + "/user/", {
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
                    text: "Failed to add user to group",
                    code: "Failed to add user to group",
                    status: 401,
                }}
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

