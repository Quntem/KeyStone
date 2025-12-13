import { PrismaClient, Role, TenantType } from "./generated/prisma/index.js";
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

export function grantUserAppAccess({ userId, appId }: { userId: string, appId: string }) {
    return prisma.userAppAccess.create({
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
            }
        },
    });
}

export async function createGroup({ tenantId, name, description, groupname }: { tenantId: string, name: string, description?: string, groupname: string }) {
    return await prisma.group.create({
        data: {
            name,
            groupname,
            description,
            tenantId,
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