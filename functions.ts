import { DeviceHardwareType, DeviceSoftwareType, GroupType, PrismaClient, Role, TenantType } from "./generated/prisma/index.js";
import * as bcrypt from "bcrypt";
import * as dns from "dns/promises";

const prisma = new PrismaClient();

const resolver = new dns.Resolver();
resolver.setServers(["1.1.1.1", "8.8.8.8"]);

export function hashPassword(password: string) {
    return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hashedPassword: string) {
    return bcrypt.compareSync(password, hashedPassword);
}

export async function createUser({ email, password, name, tenantId, username, role, domainId }: { email: string, password: string, name: string, tenantId?: string, username: string, role: string, domainId?: string }) {
    var users = await prisma.user.findMany({
        where: {
            tenantId,
            username,
        },
    });
    if (users.length > 0) {
        throw new Error("User already exists");
    }
    return await prisma.user.create({
        data: {
            email,
            password: hashPassword(password),
            name,
            role: role == "ADMIN" ? Role.ADMIN : role == "USER" ? Role.USER : role == "SERVICE" ? Role.SERVICE : Role.USER,
            tenantId,
            username,
            domainId
        },
    });
}

export function SetUserPassword({ userId, password }: { userId: string, password: string }) {
    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            password: hashPassword(password),
        },
    });
}

export async function validateUser({ userId, password }: { userId: string, password: string }) {
    var user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    if (!comparePassword(password, user.password)) {
        throw new Error("Invalid password");
    }
}

export async function getUserIdByEmail({ email }: { email: string }) {
    return await prisma.user.findUnique({
        where: {
            email,
        },
    });
}

export async function updateUser({ id, name, email, username, role, domainId }: { id: string, name: string, email: string, username: string, role: string, domainId: string }) {
    return await prisma.user.update({
        where: {
            id,
        },
        data: {
            name,
            email,
            username,
            role: role == "ADMIN" ? Role.ADMIN : role == "USER" ? Role.USER : role == "SERVICE" ? Role.SERVICE : Role.USER,
            domainId,
        },
    });
}

export async function getTenantByName({ name }: { name: string }) {
    return await prisma.tenant.findUnique({
        where: {
            name,
        },
    });
}

export async function getUserIdByUsername({ tenantId, username }: { tenantId: string, username: string }) {
    if (username.includes("/")) {
        var path = username.split("/").pop()?.concat("/");
        username = username.split("/")[1];
    }
    if (!path) {
        path = "/";
    }
    return await prisma.user.findFirst({
        where: {
            tenantId,
            path,
            username,
        },
    });
}

export function listChildTenants({ tenantId }: { tenantId: string }) {
    return prisma.tenant.findMany({
        where: {
            parentTenantId: tenantId,
        },
    });
}

export async function createSession({ userId, password }: { userId: string, password: string }) {
    var user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    if (!comparePassword(password, user.password)) {
        throw new Error("Invalid password");
    }
    if (user.role == Role.SERVICE) {
        return await prisma.session.create({
            data: {
                userId,
                expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            },
        });
    } else {
        return await prisma.session.create({
            data: {
                userId,
            },
        });
    }
}

export async function getSession({ sessionId }: { sessionId: string }) {
    var session = await prisma.session.findUnique({
        where: {
            id: sessionId,
        },
    });
    if (!session) {
        return undefined;
    }
    if (session.expiresAt < new Date()) {
        await deleteSession({ sessionId: session.id });
        return undefined;
    }
    return session;
}

export async function createTenant({ name, type }: { name: string, type: string }) {
    return await prisma.tenant.create({
        data: {
            name,
            type: type as TenantType,
        },
    });
}

export async function getUserById({ id }: { id: string }) {
    return await prisma.user.findUnique({
        where: {
            id,
        },
        include: {
            tenant: true,
            manager: {
                select: {
                    id: true,
                    username: true,
                    path: true,
                    tenant: true,
                },
            },
            groups: {
                include: {
                    group: true,
                },
            },
            devices: {
                include: {
                    mdmServer: true,
                },
            },
        },
        omit: {
            password: true,
        },
    });
}

export async function listSessions({ userId }: { userId: string }) {
    var sessions = await prisma.session.findMany({
        where: {
            userId,
        },
        include: {
            user: true,
        },
    });
    sessions.forEach((session) => {
        if (session.expiresAt < new Date()) {
            deleteSession({ sessionId: session.id });
        }
    });
    return sessions;
}

export async function deleteSession({ sessionId }: { sessionId: string }) {
    return await prisma.session.delete({
        where: {
            id: sessionId,
        },
    });
}

export async function listUsers({ tenantId, path }: { tenantId: string, path?: string }) {
    return await prisma.user.findMany({
        where: {
            tenantId,
            path: path ? path : "/",
        },
        include: {
            manager: true,
            tenant: true,
            groups: {
                include: {
                    group: true,
                },
            },
            devices: true,
        },
        omit: {
            password: true,
        },
    });
}

export async function listTenantUsers({ tenantId }: { tenantId: string }) {
    return await prisma.user.findMany({
        where: {
            tenantId,
        },
        include: {
            tenant: true,
            manager: {
                select: {
                    id: true,
                    username: true,
                    path: true,
                    tenant: true,
                },
            },
        },
        omit: {
            password: true,
        },
    });
}

export async function getTenantById({ id }: { id: string }) {
    return await prisma.tenant.findUnique({
        where: {
            id,
        },
        include: {
            tenantChildren: true,
        },
    });
}

export function revokeUserAppAccess({ id }: { id: string }) {
    return prisma.userAppAccess.delete({
        where: {
            id,
        },
    });
}

export async function grantUserAppAccess({ userId, appId }: { userId: string, appId: string }) {
    const sessions = await listSessions({ userId });
    const userAppAccess = await prisma.userAppAccess.create({
        data: {
            userId,
            appId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    tenant: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
    for (const session of sessions) {
        await createAppSession({
            userAppAccessId: userAppAccess.id,
            sessionId: session.id,
        });
    }
    return userAppAccess;
}

export function listUserAppAccess({ userId }: { userId: string }) {
    return prisma.userAppAccess.findMany({
        where: {
            userId,
        },
        include: {
            app: true,
        },
    });
}

export function createApp({ name, description, logo, allowedURLs, tenantId, mainUrl }: { name: string, description: string, logo: string, allowedURLs: string[], tenantId: string, mainUrl: string }) {
    return prisma.app.create({
        data: {
            name,
            description,
            logo,
            allowedURLs,
            tenantId,
            mainUrl,
        },
    });
}

export function getAppById({ id, includeExternal }: { id: string, includeExternal?: boolean }) {
    return prisma.app.findUnique({
        where: {
            id,
        },
        include: {
            tenant: {
                select: {
                    id: true,
                    name: true,
                    displayName: true,
                },
            },
            inExternalTenants: includeExternal
        },
    });
}

export function userHasAppAccess({ userId, appId }: { userId: string, appId: string }) {
    return prisma.userAppAccess.findUnique({
        where: {
            userId_appId: {
                appId,
                userId,
            },
        },
    });
}

export async function listTenantApps({ tenantId }: { tenantId: string }) {
    const apps = await prisma.app.findMany({
        where: {
            OR: [
                {
                    tenantId,
                },
                {
                    inExternalTenants: {
                        some: {
                            tenantId,
                        },
                    },
                },
            ],
        },
        include: {
            userAppAccess: {
                where: {
                    user: {
                        tenantId,
                    },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            tenant: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            },
            tenant: {
                select: {
                    id: true,
                    name: true,
                    displayName: true,
                },
            },
        },
    });
    var apps2 = apps.map((item) => {
        console.log(item.tenantId)
        if (item.tenantId != tenantId) {
            item.secret = ""
        }
        return item
    })
    console.log(apps2)
    return apps2
}

export function updateApp({ id, name, description, logo, allowedURLs, mainUrl, availableForExternal }: { id: string, name: string, description: string, logo: string, allowedURLs: string[], mainUrl: string, availableForExternal: boolean }) {
    return prisma.app.update({
        where: {
            id,
        },
        data: {
            name,
            description,
            logo,
            allowedURLs,
            mainUrl,
            availableForExternal,
        },
    });
}

export function deleteApp({ id }: { id: string }) {
    return prisma.app.delete({
        where: {
            id,
        },
    });
}

export function listAppSessions({ sessionId }: { sessionId: string }) {
    return prisma.userAppSession.findMany({
        where: {
            sessionId,
        },
    });
}

export function createAppSession({ userAppAccessId, sessionId }: { userAppAccessId: string, sessionId: string }) {
    return prisma.userAppSession.create({
        data: {
            userAppAccessId,
            sessionId,
        },
    });
}

export function deleteAppSession({ id }: { id: string }) {
    return prisma.userAppSession.delete({
        where: {
            id,
        },
    });
}

export function getUserAppAccess({ id }: { id: string }) {
    return prisma.userAppAccess.findUnique({
        where: {
            id,
        },
        include: {
            app: true,
            user: {
                select: {
                    tenantId: true,
                    username: true,
                    name: true,
                    email: true,
                    role: true,
                },
            }
        },
    });
}

export function getUserAppAccessByUserIdAndAppId({ userId, appId }: { userId: string, appId: string }) {
    return prisma.userAppAccess.findUnique({
        where: {
            userId_appId: {
                userId,
                appId,
            },
        },
    });
}

export async function setUserDisabled({ id, disabled }: { id: string, disabled: boolean }) {
    const user = await prisma.user.update({
        where: {
            id,
        },
        data: {
            disabled,
        },
    });
    if (disabled) {
        const sessions = await listSessions({ userId: id });
        for (const session of sessions) {
            await deleteSession({ sessionId: session.id });
        }
    }
    return user;
}

export async function setTenantLogo({ id, logo }: { id: string, logo: string }) {
    return prisma.tenant.update({
        where: {
            id,
        },
        data: {
            logo,
        },
    });
}

export async function setTenantColor({ id, color }: { id: string, color: string }) {
    return prisma.tenant.update({
        where: {
            id,
        },
        data: {
            color,
        },
    });
}

export async function setTenantColorContrast({ id, colorContrast }: { id: string, colorContrast: string }) {
    return prisma.tenant.update({
        where: {
            id,
        },
        data: {
            colorContrast,
        },
    });
}

export async function setTenantDescription({ id, description }: { id: string, description: string }) {
    return prisma.tenant.update({
        where: {
            id,
        },
        data: {
            description,
        },
    });
}

export async function setTenantGroupCreationPermition({ id, allowGroupCreation }: { id: string, allowGroupCreation: boolean }) {
    return prisma.tenant.update({
        where: {
            id,
        },
        data: {
            allowGroupCreation,
        },
    });
}

export async function setTenantDisplayName({ id, displayName }: { id: string, displayName: string }) {
    return prisma.tenant.update({
        where: {
            id,
        },
        data: {
            displayName,
        },
    });
}

export async function verifyDomain({ domainId }: { domainId: string }) {
    const domain = await prisma.domain.findUnique({
        where: {
            id: domainId,
        },
    });
    if (!domain) {
        throw new Error("Domain not found");
    }
    const addresses = await dns.resolve("_quntem-challenge." + domain.name, "TXT");
    var hasAddress = false;
    addresses.forEach((address) => {
        if (address.includes(domain.id)) {
            hasAddress = true;
        }
    });
    return await prisma.domain.update({
        where: {
            id: domainId,
        },
        data: {
            verified: hasAddress,
        },
    });
}

export async function createDomain({ name, creatorId, tenantId }: { name: string, creatorId?: string, tenantId: string }) {
    return await prisma.domain.create({
        data: {
            name,
            creatorId,
            tenantId,
        },
    });
}

export async function deleteDomain({ id }: { id: string }) {
    return await prisma.domain.delete({
        where: {
            id,
        },
    });
}

export async function getDomainByName({ name }: { name: string }) {
    return await prisma.domain.findUnique({
        where: {
            name,
        },
    });
}

export async function getDomainById({ id }: { id: string }) {
    return await prisma.domain.findUnique({
        where: {
            id,
        },
    });
}

export async function listDomains({ tenantId }: { tenantId: string }) {
    return await prisma.domain.findMany({
        where: {
            tenantId,
        },
        include: {
            creator: true,
            domainUsers: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    email: true,
                    role: true,
                }
            }
        },
    });
}

export async function updateDomain({ id, name, creatorId, tenantId }: { id: string, name: string, creatorId?: string, tenantId: string }) {
    return await prisma.domain.update({
        where: {
            id,
        },
        data: {
            name,
            creatorId,
            tenantId,
        },
    });
}

export async function getAppSessionToken({ appId, userId, sessionId }: { appId: string, userId: string, sessionId: string }) {
    const appUserAccess = await userHasAppAccess({ userId, appId });
    if (!appUserAccess?.id) {
        throw new Error("User app access not found");
    }
    return await prisma.userAppSession.findUnique({
        where: {
            userAppAccessId_sessionId: {
                userAppAccessId: appUserAccess.id,
                sessionId,
            },
        },
        select: {
            id: true,
            userAppAccessId: true,
            createdAt: true,
            userAppAccess: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            email: true,
                            role: true,
                            groups: {
                                include: {
                                    group: true,
                                },
                            },
                            tenant: true,
                            userAppAccess: {
                                include: {
                                    app: {
                                        select: {
                                            id: true,
                                            name: true,
                                            logo: true,
                                            description: true,
                                            mainUrl: true
                                        }
                                    }
                                }
                            }
                        },
                    },
                    app: true,
                },
            },
        },
    });
}

export async function getAppSessionById({ id }: { id: string }) {
    return await prisma.userAppSession.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            userAppAccessId: true,
            createdAt: true,
            userAppAccess: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            email: true,
                            role: true,
                            groups: {
                                include: {
                                    group: true,
                                },
                            },
                            tenant: true,
                        },
                    },
                    app: true,
                },
            },
        },
    });
}

export async function listGroups({ tenantId }: { tenantId: string }) {
    return await prisma.group.findMany({
        where: {
            tenantId,
        },
        include: {
            users: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            email: true,
                            role: true,
                            groups: true,
                        },
                    },
                }
            },
            devices: {
                include: {
                    device: true,
                },
            },
        },
    });
}

export async function createGroup({ tenantId, name, description, groupname, createdBy, adminCreated, type }: { tenantId: string, name: string, description?: string, groupname: string, createdBy: string, adminCreated: boolean, type: GroupType }) {
    return await prisma.group.create({
        data: {
            name,
            groupname,
            description,
            tenantId,
            adminCreated,
            createdBy,
            type,
        },
    });
}

export async function updateGroup({ id, name, description, groupname }: { id: string, name: string, description?: string, groupname: string }) {
    return await prisma.group.update({
        where: {
            id,
        },
        data: {
            name,
            groupname,
            description,
        },
    });
}

export async function deleteGroup({ id }: { id: string }) {
    return await prisma.group.delete({
        where: {
            id,
        },
    });
}

export function getGroupById({ id }: { id: string }) {
    return prisma.group.findUnique({
        where: {
            id,
        },
        include: {
            users: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                }
            },
            devices: {
                include: {
                    device: true,
                },
            },
        },
    });
}

export async function addUserToGroup({ userId, groupId }: { userId: string, groupId: string }) {
    return await prisma.groupUser.create({
        data: {
            userId,
            groupId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
            group: {
                select: {
                    id: true,
                    name: true,
                    groupname: true,
                    description: true,
                },
            },
        },
    });
}

export async function removeUserFromGroup({ userId, groupId }: { userId: string, groupId: string }) {
    return await prisma.groupUser.delete({
        where: {
            userId_groupId: {
                groupId,
                userId,
            },
        },
    });
}

export async function AddTenantToApp({ tenantId, appId }: { tenantId: string, appId: string }) {
    return await prisma.externalAppAccess.create({
        data: {
            tenantId,
            appId,
        },
    });
}

export async function RemoveTenantFromApp({ tenantId, appId }: { tenantId: string, appId: string }) {
    return await prisma.externalAppAccess.delete({
        where: {
            appId_tenantId: {
                appId,
                tenantId,
            },
        },
    });
}

export function UpgradeToFullTenant({ tenantId }: { tenantId: string }) {
    return prisma.tenant.update({
        where: {
            id: tenantId,
        },
        data: {
            type: "Organization",
        },
    });
}

export async function createDevice({ name, hardwareType, softwareType, os, osVersion, assignedTo, mdmServerId, extraInfo, displayName, tenantId, isSelfEnrolled, enrolledById, groups }: { name: string, hardwareType: DeviceHardwareType, softwareType: DeviceSoftwareType, os: string, osVersion: string, assignedTo: string, mdmServerId: string | null, extraInfo: any, displayName: string, tenantId: string, isSelfEnrolled: boolean, enrolledById: string, groups: string[] }) {
    if (!mdmServerId) {
        const defaultMDMServer = await prisma.mdmServer.findUnique({
            where: {
                tenantId_isDefault: {
                    tenantId,
                    isDefault: true,
                },
            },
        });
        if (!defaultMDMServer) {
            mdmServerId = null
        } else {
            mdmServerId = defaultMDMServer.id;
        }
    }
    const device = await prisma.device.create({
        data: {
            name: name.toLowerCase(),
            displayName: displayName || name,
            tenantId,
            hardwareType,
            softwareType,
            os,
            osVersion,
            assignedTo: assignedTo || isSelfEnrolled ? enrolledById : null,
            mdmServerId,
            extraInfo,
            isSelfEnrolled,
            enrolledById,
            lastCheckIn: new Date(),
            groups: {
                create: groups.map((group: any) => ({
                    group: {
                        connect: {
                            id: group,
                        },
                    },
                })),
            },
        },
        include: {
            tenant: true,
            groups: {
                include: {
                    group: true,
                },
            },
            mdmServer: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
    if (mdmServerId) {
        const mdmServer = await prisma.mdmServer.findUnique({
            where: {
                id: mdmServerId,
            },
        });
        if (!mdmServer) {
            prisma.device.update({
                where: {
                    id: device.id,
                },
                data: {
                    mdmServerId: null,
                },
            });
            return device;
        }
        const response = await fetch(mdmServer.url + "/api/v1/keystone/webhook/device", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${mdmServer.enrollmentToken}`,
            },
            body: JSON.stringify({
                "event": "enroll",
                "tenantId": tenantId,
                "device": device,
            }),
        });
        const responseData = await response.json();
        if (!response.ok) {
            console.log("Failed to enroll device in MDM");
            await deleteDevice({ id: device.id });
            return null;
        } else {
            const updatedDevice = await prisma.device.update({
                where: {
                    id: device.id,
                },
                data: {
                    token: responseData.token.token,
                },
                include: {
                    tenant: true,
                    groups: {
                        include: {
                            group: true,
                        },
                    },
                    mdmServer: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            });
            return updatedDevice;
        }
    }
    return device;
}

export async function updateDevice({ id, name, hardwareType, softwareType, os, osVersion, assignedTo, mdmServerId, extraInfo, displayName, lastCheckIn }: { id: string, name?: string, hardwareType?: DeviceHardwareType, softwareType?: DeviceSoftwareType, os?: string, osVersion?: string, assignedTo?: string, mdmServerId?: string, extraInfo?: any, displayName?: string, lastCheckIn?: Date }) {
    const device = await prisma.device.findUnique({
        where: {
            id,
        },
        include: {
            tenant: true,
            groups: {
                include: {
                    group: true,
                },
            },
            mdmServer: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
    if (!device) {
        return null;
    }
    if (mdmServerId && device.mdmServerId !== mdmServerId) {
        const mdmServer = await prisma.mdmServer.findUnique({
            where: {
                id: mdmServerId,
            },
        });
        if (!mdmServer) {
            return null;
        }
        const response = await fetch(mdmServer.url + "/api/v1/keystone/webhook/device", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${device.mdmServer.enrollmentToken}`,
            },
            body: JSON.stringify({
                "event": "unenroll",
                "tenantId": device.tenantId,
                "device": device,
            }),
        });
        await fetch(mdmServer.url + "/api/v1/keystone/webhook/device", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${mdmServer.enrollmentToken}`,
            },
            body: JSON.stringify({
                "event": "enroll",
                "tenantId": device.tenantId,
                "device": device,
            }),
        });
    }
    const updatedDevice = await prisma.device.update({
        where: {
            id,
        },
        data: {
            name,
            displayName: displayName || name,
            hardwareType,
            softwareType,
            os,
            osVersion,
            assignedTo: assignedTo || null,
            mdmServerId,
            extraInfo,
            lastCheckIn
        },
        include: {
            tenant: true,
            groups: {
                include: {
                    group: true,
                },
            },
            mdmServer: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
    if (device.assignedTo !== updatedDevice.assignedTo || device.displayName !== updatedDevice.displayName) {
        const response = await fetch(updatedDevice.mdmServer.url + "/api/v1/keystone/webhook/device", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${updatedDevice.mdmServer.enrollmentToken}`,
            },
            body: JSON.stringify({
                "event": "groupsmodify",
                "tenantId": device.tenantId,
                "device": updatedDevice,
            }),
        });
    }
    return updatedDevice;
}

export async function deleteDevice({ id }: { id: string }) {
    return await prisma.device.delete({
        where: {
            id,
        },
    });
}

export async function getDeviceById({ id }: { id: string }) {
    return await prisma.device.findUnique({
        where: {
            id,
        },
        include: {
            groups: {
                include: {
                    group: true,
                },
            },
            mdmServer: true,
            tenant: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
}

export async function listDevices({ tenantId }: { tenantId: string }) {
    return await prisma.device.findMany({
        where: {
            tenantId,
        },
        include: {
            groups: {
                include: {
                    group: true,
                },
            },
            mdmServer: true,
            tenant: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
}

export async function addDeviceToGroup({ deviceId, groupId }: { deviceId: string, groupId: string }) {
    const deviceGroup = await prisma.deviceGroup.create({
        data: {
            deviceId,
            groupId,
        },
        include: {
            group: true,
            device: true,
        },
    });
    const device = await getDeviceById({ id: deviceId });
    if (!device?.mdmServer) {
        return deviceGroup;
    }
    const response = await fetch(device?.mdmServer?.url + "/api/v1/keystone/webhook/device", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${device?.mdmServer?.enrollmentToken}`,
        },
        body: JSON.stringify({
            "event": "groupsmodify",
            "tenantId": device?.tenantId,
            "device": device,
        }),
    });
    return deviceGroup;
}

export async function removeDeviceFromGroup({ deviceId, groupId }: { deviceId: string, groupId: string }) {
    const deviceGroup = await prisma.deviceGroup.delete({
        where: {
            deviceId_groupId: {
                deviceId,
                groupId,
            },
        },
    });
    const device = await getDeviceById({ id: deviceId });
    if (!device?.mdmServer) {
        return deviceGroup;
    }
    const response = await fetch(device?.mdmServer?.url + "/api/v1/keystone/webhook/device", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${device?.mdmServer?.enrollmentToken}`,
        },
        body: JSON.stringify({
            "event": "groupsmodify",
            "tenantId": device?.tenantId,
            "device": device,
        }),
    });
    return deviceGroup;
}

export async function createMDMServer({ name, tenantId, url, enrollmentToken, isDefault }: { name: string, tenantId: string, url: string, enrollmentToken: string, isDefault: boolean }) {
    return await prisma.mdmServer.create({
        data: {
            name,
            tenantId,
            url,
            enrollmentToken,
            isDefault,
        },
    });
}

export async function updateMDMServer({ id, name, tenantId, url, enrollmentToken, isDefault }: { id: string, name: string, tenantId: string, url: string, enrollmentToken: string, isDefault: boolean }) {
    return await prisma.mdmServer.update({
        where: {
            id,
        },
        data: {
            name,
            tenantId,
            url,
            enrollmentToken,
            isDefault,
        },
    });
}

export async function deleteMDMServer({ id }: { id: string }) {
    return await prisma.mdmServer.delete({
        where: {
            id,
        },
    });
}

export async function listMDMServers({ tenantId }: { tenantId: string }) {
    return await prisma.mdmServer.findMany({
        where: {
            tenantId,
        },
        include: {
            _count: {
                select: {
                    devices: true,
                },
            },
        },
    });
}

export async function getDeviceByDeviceName({ tenantId, deviceName }: { tenantId: string, deviceName: string }) {
    return await prisma.device.findFirst({
        where: {
            tenantId,
            name: deviceName
        },
        include: {
            groups: {
                include: {
                    group: true,
                },
            },
            mdmServer: true,
            tenant: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
}