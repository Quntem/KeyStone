import { useEffect, useState } from "react";

export function useUsersList() {
    const reload = () => {
        setUsersList({ data: null, loaded: false, reload });
    };
    const [usersList, setUsersList] = useState({ data: null, loaded: false, reload });
    useEffect(() => {
        if (!usersList.loaded) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/users", { credentials: "include", redirect: "manual" }).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    console.log("unauthorized");
                    return {
                        users: null, error: {
                            text: "Unauthorized",
                            code: "Unauthorized",
                            status: 401,
                        }
                    }
                }
            }).then((data) => {
                setUsersList({ data: { users: data } as any, loaded: true, reload });
            });
        }
    }, [usersList.loaded]);
    return usersList;
}

export function useDevicesList() {
    const reload = () => {
        setDevicesList({ data: null, loaded: false, reload });
    };
    const [devicesList, setDevicesList] = useState({ data: null, loaded: false, reload });
    useEffect(() => {
        if (!devicesList.loaded) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/devices", { credentials: "include", redirect: "manual" }).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    console.log("unauthorized");
                    return {
                        users: null, error: {
                            text: "Unauthorized",
                            code: "Unauthorized",
                            status: 401,
                        }
                    }
                }
            }).then((data) => {
                setDevicesList({ data, loaded: true, reload });
            });
        }
    }, [devicesList.loaded]);
    return devicesList;
}

export function useMDMServersList() {
    const reload = () => {
        setMDMServersList({ data: null, loaded: false, reload });
    };
    const [MDMServersList, setMDMServersList] = useState({ data: null, loaded: false, reload });
    useEffect(() => {
        if (!MDMServersList.loaded) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/mdmservers", { credentials: "include", redirect: "manual" }).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    console.log("unauthorized");
                    return {
                        users: null, error: {
                            text: "Unauthorized",
                            code: "Unauthorized",
                            status: 401,
                        }
                    }
                }
            }).then((data) => {
                setMDMServersList({ data, loaded: true, reload });
            });
        }
    }, [MDMServersList.loaded]);
    return MDMServersList;
}

export function useTenantsList() {
    const reload = () => {
        setUsersList({ data: null, loaded: false, reload });
    };
    const [usersList, setUsersList] = useState({ data: null, loaded: false, reload });
    useEffect(() => {
        if (!usersList.loaded) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/tenants", { credentials: "include", redirect: "manual" }).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    console.log("unauthorized");
                    return {
                        error: {
                            text: "Unauthorized",
                            code: "Unauthorized",
                            status: 401,
                        }
                    }
                }
            }).then((data) => {
                setUsersList({ data: data, loaded: true, reload });
            });
        }
    }, [usersList.loaded]);
    return usersList;
}

export function createUser({
    name,
    username,
    email,
    role,
    tenantId,
    password,
    domainId,
    locationId,
    departmentIds,
    orgRoleIds,
    tags,
}: {
    name: string;
    username: string;
    email: string;
    role: string;
    tenantId: string;
    password: string;
    domainId: string;
    locationId?: string;
    departmentIds?: string[];
    orgRoleIds?: string[];
    tags?: string[];
}) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/user", {
            credentials: "include",
            redirect: "manual",
            method: "POST",
            body: JSON.stringify({ name, username, email, role, tenantId, password, domainId, locationId, departmentIds, orgRoleIds, tags }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to create user",
                        code: "Failed to create user",
                        status: 401,
                    }
                }
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
            body: JSON.stringify({ disabled }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to disable user",
                        code: "Failed to disable user",
                        status: 401,
                    }
                }
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
            body: JSON.stringify({ logo }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to set tenant logo",
                        code: "Failed to set tenant logo",
                        status: 401,
                    }
                }
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
            body: JSON.stringify({ description }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to set tenant description",
                        code: "Failed to set tenant description",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function setTenantGroupCreationPermition(allowGroupCreation: boolean) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/tenant/setGroupCreationPermition", {
            credentials: "include",
            redirect: "manual",
            method: "POST",
            body: JSON.stringify({ allowGroupCreation }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to set tenant group creation permission",
                        code: "Failed to set tenant group creation permission",
                        status: 401,
                    }
                }
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
            body: JSON.stringify({ displayName }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to set tenant display name",
                        code: "Failed to set tenant display name",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function useAdminAppsList() {
    const reload = () => {
        setAppsList({ data: null, loaded: false, reload });
    };
    const [appsList, setAppsList] = useState({ data: null, loaded: false, reload });
    useEffect(() => {
        if (!appsList.loaded) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/apps", { credentials: "include", redirect: "manual" }).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    console.log("unauthorized");
                    return {
                        error: {
                            text: "Unauthorized",
                            code: "Unauthorized",
                            status: 401,
                        }
                    }
                }
            }).then((data) => {
                setAppsList({ data: data, loaded: true, reload });
            });
        }
    }, [appsList.loaded]);
    return appsList;
}

export function CreateApp({ name, description, logo, mainUrl }: { name: string, description: string, logo: string, mainUrl: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/app", {
            credentials: "include",
            redirect: "manual",
            method: "POST",
            body: JSON.stringify({ name, description, logo, mainUrl }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to create app",
                        code: "Failed to create app",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function createMDMServer({ name, url, enrollmentToken, isDefault }: { name: string, url: string, enrollmentToken: string, isDefault: boolean }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/mdmserver", {
            credentials: "include",
            redirect: "manual",
            method: "POST",
            body: JSON.stringify({ name, url, enrollmentToken, isDefault }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to create MDM server",
                        code: "Failed to create MDM server",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function AddUserToApp({ userId, appId }: { userId: string, appId: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/app/" + appId + "/userappaccess", {
            credentials: "include",
            redirect: "manual",
            method: "POST",
            body: JSON.stringify({ userId }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to add user to app",
                        code: "Failed to add user to app",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function getUserByUsername(username: string) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/user/username/" + username, { credentials: "include", redirect: "manual" }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Unauthorized",
                        code: "Unauthorized",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function getDeviceByDeviceName(deviceName: string) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/device/devicename/" + deviceName, { credentials: "include", redirect: "manual" }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Unauthorized",
                        code: "Unauthorized",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function removeUserFromApp({ accessId, appId }: { accessId: string, appId: string }) {
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
                return {
                    error: {
                        text: "Failed to remove user from app",
                        code: "Failed to remove user from app",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function updateUser({
    userId,
    name,
    username,
    email,
    role,
    domainId,
    locationId,
    departmentIds,
    orgRoleIds,
    tags,
}: {
    userId: string;
    name: string;
    username: string;
    email: string;
    role: string;
    domainId: string;
    locationId?: string | null;
    departmentIds?: string[];
    orgRoleIds?: string[];
    tags?: string[];
}) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/user/" + userId, {
            credentials: "include",
            redirect: "manual",
            method: "PATCH",
            body: JSON.stringify({ name, username, email, role, domainId, locationId, departmentIds, orgRoleIds, tags }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to update user",
                        code: "Failed to update user",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function setUserPassword({ userId, password }: { userId: string, password: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/user/" + userId + "/setpassword", {
            credentials: "include",
            redirect: "manual",
            method: "POST",
            body: JSON.stringify({ password }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to update user password",
                        code: "Failed to update user password",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function updateApp({ appId, name, description, logo, mainUrl, availableForExternal, allowedURLs }: { appId: string, name: string, description: string, logo: string, mainUrl: string, availableForExternal: boolean, allowedURLs: string[] }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/app/" + appId, {
            credentials: "include",
            redirect: "manual",
            method: "POST",
            body: JSON.stringify({ name, description, logo, mainUrl, availableForExternal, allowedURLs }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to update app",
                        code: "Failed to update app",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function updateDevice({ id, name, hardwareType, softwareType, os, osVersion, assignedTo, mdmServerId, extraInfo, displayName, locationId, tags }: { id: string, name: string, hardwareType: string, softwareType: string, os: string, osVersion: string, assignedTo: string, mdmServerId: string, extraInfo: any, displayName: string, locationId?: string, tags?: string[] }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/device/" + id, {
            credentials: "include",
            redirect: "manual",
            method: "POST",
            body: JSON.stringify({ name, hardwareType, softwareType, os, osVersion, assignedTo, mdmServerId, extraInfo, displayName, locationId, tags }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to update device",
                        code: "Failed to update device",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function createDomain({ domain }: { domain: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/domain", {
            credentials: "include",
            redirect: "manual",
            method: "POST",
            body: JSON.stringify({ domain }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to create domain",
                        code: "Failed to create domain",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function createDepartment({ name }: { name: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/departments", {
            credentials: "include",
            redirect: "manual",
            method: "POST",
            body: JSON.stringify({ name }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                return {
                    error: {
                        text: "Failed to create department",
                        code: "Failed to create department",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function updateDepartment({ id, name }: { id: string, name: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/departments/" + id, {
            credentials: "include",
            redirect: "manual",
            method: "PATCH",
            body: JSON.stringify({ name }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                return {
                    error: {
                        text: "Failed to update department",
                        code: "Failed to update department",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function deleteDepartment({ id }: { id: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/departments/" + id, {
            credentials: "include",
            redirect: "manual",
            method: "DELETE",
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                return {
                    error: {
                        text: "Failed to delete department",
                        code: "Failed to delete department",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function createLocation({ name }: { name: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/locations", {
            credentials: "include",
            redirect: "manual",
            method: "POST",
            body: JSON.stringify({ name }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                return {
                    error: {
                        text: "Failed to create location",
                        code: "Failed to create location",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function updateLocation({ id, name }: { id: string, name: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/locations/" + id, {
            credentials: "include",
            redirect: "manual",
            method: "PATCH",
            body: JSON.stringify({ name }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                return {
                    error: {
                        text: "Failed to update location",
                        code: "Failed to update location",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function deleteLocation({ id }: { id: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/locations/" + id, {
            credentials: "include",
            redirect: "manual",
            method: "DELETE",
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                return {
                    error: {
                        text: "Failed to delete location",
                        code: "Failed to delete location",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function createOrgRole({ name }: { name: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/orgroles", {
            credentials: "include",
            redirect: "manual",
            method: "POST",
            body: JSON.stringify({ name }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                return {
                    error: {
                        text: "Failed to create org role",
                        code: "Failed to create org role",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function updateOrgRole({ id, name }: { id: string, name: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/orgroles/" + id, {
            credentials: "include",
            redirect: "manual",
            method: "PATCH",
            body: JSON.stringify({ name }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                return {
                    error: {
                        text: "Failed to update org role",
                        code: "Failed to update org role",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function deleteOrgRole({ id }: { id: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/orgroles/" + id, {
            credentials: "include",
            redirect: "manual",
            method: "DELETE",
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                return {
                    error: {
                        text: "Failed to delete org role",
                        code: "Failed to delete org role",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function verifyDomain({ domainId }: { domainId: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/domain/" + domainId + "/verify", {
            credentials: "include",
            redirect: "manual",
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to verify domain",
                        code: "Failed to verify domain",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function useDomainsList() {
    const reload = () => {
        setDomainsList({ data: null, loaded: false, reload });
    };
    const [domainsList, setDomainsList] = useState({ data: null, loaded: false, reload });
    useEffect(() => {
        if (!domainsList.loaded) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/domains", { credentials: "include", redirect: "manual" }).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    console.log("unauthorized");
                    return {
                        error: {
                            text: "Unauthorized",
                            code: "Unauthorized",
                            status: 401,
                        }
                    }
                }
            }).then((data) => {
                setDomainsList({ data: data, loaded: true, reload });
            });
        }
    }, [domainsList.loaded]);
    return domainsList;
}

export function useGroupsList() {
    const reload = () => {
        setGroupsList({ data: null, loaded: false, reload });
    };
    const [groupsList, setGroupsList] = useState({ data: null, loaded: false, reload });
    useEffect(() => {
        if (!groupsList.loaded) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/groups", { credentials: "include", redirect: "manual" }).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    console.log("unauthorized");
                    return {
                        error: {
                            text: "Unauthorized",
                            code: "Unauthorized",
                            status: 401,
                        }
                    }
                }
            }).then((data) => {
                setGroupsList({ data: data, loaded: true, reload });
            });
        }
    }, [groupsList.loaded]);
    return groupsList;
}

export function useDepartmentsList() {
    const reload = () => {
        setDepartmentsList({ data: null, loaded: false, reload });
    };
    const [departmentsList, setDepartmentsList] = useState({ data: null, loaded: false, reload });
    useEffect(() => {
        if (!departmentsList.loaded) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/departments", { credentials: "include", redirect: "manual" }).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    return { error: { text: "Unauthorized", code: "Unauthorized", status: 401 } };
                }
            }).then((data) => {
                setDepartmentsList({ data, loaded: true, reload });
            });
        }
    }, [departmentsList.loaded]);
    return departmentsList;
}

export function useLocationsList() {
    const reload = () => {
        setLocationsList({ data: null, loaded: false, reload });
    };
    const [locationsList, setLocationsList] = useState({ data: null, loaded: false, reload });
    useEffect(() => {
        if (!locationsList.loaded) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/locations", { credentials: "include", redirect: "manual" }).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    return { error: { text: "Unauthorized", code: "Unauthorized", status: 401 } };
                }
            }).then((data) => {
                setLocationsList({ data, loaded: true, reload });
            });
        }
    }, [locationsList.loaded]);
    return locationsList;
}

export function useOrgRolesList() {
    const reload = () => {
        setOrgRolesList({ data: null, loaded: false, reload });
    };
    const [orgRolesList, setOrgRolesList] = useState({ data: null, loaded: false, reload });
    useEffect(() => {
        if (!orgRolesList.loaded) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/orgroles", { credentials: "include", redirect: "manual" }).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    return { error: { text: "Unauthorized", code: "Unauthorized", status: 401 } };
                }
            }).then((data) => {
                setOrgRolesList({ data, loaded: true, reload });
            });
        }
    }, [orgRolesList.loaded]);
    return orgRolesList;
}

export function CreateGroup({ name, description, groupname, type }: { name: string, description: string, groupname: string, type?: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/group", {
            credentials: "include",
            redirect: "manual",
            method: "POST",
            body: JSON.stringify({ name, description, groupname, type }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to create group",
                        code: "Failed to create group",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function updateGroup({ groupId, name, description, groupname, type }: { groupId: string, name: string, description: string, groupname: string, type?: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/group/" + groupId, {
            credentials: "include",
            redirect: "manual",
            method: "PATCH",
            body: JSON.stringify({ name, description, groupname, type }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to update group",
                        code: "Failed to update group",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function getGroupById({ groupId }: { groupId: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/group/" + groupId, {
            credentials: "include",
            redirect: "manual",
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to load group",
                        code: "Failed to load group",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function recalculateMagicGroup({ groupId }: { groupId: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/group/" + groupId + "/recalculate", {
            credentials: "include",
            redirect: "manual",
            method: "POST",
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to recalculate magic group",
                        code: "Failed to recalculate magic group",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function listMagicGroupConditions({ groupId }: { groupId: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/group/" + groupId + "/conditions", {
            credentials: "include",
            redirect: "manual",
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to load magic group conditions",
                        code: "Failed to load magic group conditions",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function createMagicGroupCondition({
    groupId,
    targetType,
    attribute,
    operator,
    value,
}: {
    groupId: string;
    targetType: string;
    attribute: string;
    operator: string;
    value: string;
}) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/group/" + groupId + "/conditions", {
            credentials: "include",
            redirect: "manual",
            method: "POST",
            body: JSON.stringify({ targetType, attribute, operator, value }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to create magic group condition",
                        code: "Failed to create magic group condition",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function updateMagicGroupCondition({
    conditionId,
    targetType,
    attribute,
    operator,
    value,
}: {
    conditionId: string;
    targetType?: string;
    attribute?: string;
    operator?: string;
    value?: string;
}) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/group/conditions/" + conditionId, {
            credentials: "include",
            redirect: "manual",
            method: "PATCH",
            body: JSON.stringify({ targetType, attribute, operator, value }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to update magic group condition",
                        code: "Failed to update magic group condition",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function deleteMagicGroupCondition({ conditionId }: { conditionId: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/group/conditions/" + conditionId, {
            credentials: "include",
            redirect: "manual",
            method: "DELETE",
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to delete magic group condition",
                        code: "Failed to delete magic group condition",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function removeUserFromGroup({ groupId, userId }: { groupId: string, userId: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/group/" + groupId + "/user/", {
            credentials: "include",
            redirect: "manual",
            method: "DELETE",
            body: JSON.stringify({ userId }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to remove user from group",
                        code: "Failed to remove user from group",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function addUserToGroup({ groupId, userId }: { groupId: string, userId: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/group/" + groupId + "/user/", {
            credentials: "include",
            redirect: "manual",
            method: "POST",
            body: JSON.stringify({ userId }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to add user to group",
                        code: "Failed to add user to group",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function removeDeviceFromGroup({ groupId, deviceId }: { groupId: string, deviceId: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/group/" + groupId + "/device/", {
            credentials: "include",
            redirect: "manual",
            method: "DELETE",
            body: JSON.stringify({ deviceId }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to remove user from group",
                        code: "Failed to remove user from group",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function addDeviceToGroup({ groupId, deviceId }: { groupId: string, deviceId: string }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/group/" + groupId + "/device/", {
            credentials: "include",
            redirect: "manual",
            method: "POST",
            body: JSON.stringify({ deviceId }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to add user to group",
                        code: "Failed to add user to group",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}

export function updateMDM({ id, isDefault }: { id: string, isDefault: boolean }) {
    return new Promise((resolve, reject) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/mdmserver/" + id, {
            credentials: "include",
            redirect: "manual",
            method: "POST",
            body: JSON.stringify({ isDefault }),
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
            }
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                console.log("unauthorized");
                return {
                    error: {
                        text: "Failed to update MDM",
                        code: "Failed to update MDM",
                        status: 401,
                    }
                }
            }
        }).then((data) => {
            resolve(data);
        });
    });
}
