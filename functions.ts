import { PrismaClient, Role } from "./generated/prisma/index.js";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

export function hashPassword(password: string) {
    return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hashedPassword: string) {
    return bcrypt.compareSync(password, hashedPassword);
}

export async function createUser({email, password, name, tenantId, username, role}: {email: string, password: string, name: string, tenantId: string, username: string, role: string}) {
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
        },
    });
}

export async function validateUser({userId, password}: {userId: string, password: string}) {
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

export async function getUserIdByEmail({email}: {email: string}) {
    return await prisma.user.findUnique({
        where: {
            email,
        },
    });
}

export async function getTenantByName({name}: {name: string}) {
    return await prisma.tenant.findUnique({
        where: {
            name,
        },
    });
}

export async function getUserIdByUsername({tenantId, username}: {tenantId: string, username: string}) {
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

export function listChildTenants({tenantId}: {tenantId: string}) {
    return prisma.tenant.findMany({
        where: {
            parentTenantId: tenantId,
        },
    });
}

export async function createSession({userId, password}: {userId: string, password: string}) {
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
    return await prisma.session.create({
        data: {
            userId,
        },
    });
}

export async function getSession({sessionId}: {sessionId: string}) {
    var session = await prisma.session.findUnique({
        where: {
            id: sessionId,
        },
    });
    if (!session) {
        return undefined;
    }
    if (session.expiresAt < new Date()) {
        await deleteSession({sessionId: session.id});
        return undefined;
    }
    return session;
}

export async function createTenant({name}: {name: string}) {
    return await prisma.tenant.create({
        data: {
            name,
        },
    });
}

export async function getUserById({id}: {id: string}) {
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

export async function listSessions({userId}: {userId: string}) {
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
            deleteSession({sessionId: session.id});
        }
    });
    return sessions;
}

export async function deleteSession({sessionId}: {sessionId: string}) {
    return await prisma.session.delete({
        where: {
            id: sessionId,
        },
    });
}

export async function listUsers({tenantId, path}: {tenantId: string, path?: string}) {
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

export async function listTenantUsers({tenantId}: {tenantId: string}) {
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

export async function getTenantById({id}: {id: string}) {
    return await prisma.tenant.findUnique({
        where: {
            id,
        },
        include: {
            tenantChildren: true,
        },
    });
}

export function revokeUserAppAccess({id}: {id: string}) {
    return prisma.userAppAccess.delete({
        where: {
            id,
        },
    });
}

export function grantUserAppAccess({userId, appId}: {userId: string, appId: string}) {
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

export function listUserAppAccess({userId}: {userId: string}) {
    return prisma.userAppAccess.findMany({
        where: {
            userId,
        },
    });
}

export function createApp({name, description, logo, allowedURLs, tenantId, mainUrl}: {name: string, description: string, logo: string, allowedURLs: string[], tenantId: string, mainUrl: string}) {
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

export function getAppById({id}: {id: string}) {
    return prisma.app.findUnique({
        where: {
            id,
        },
    });
}

export function listTenantApps({tenantId}: {tenantId: string}) {
    return prisma.app.findMany({
        where: {
            tenantId,
        },
        include: {
            userAppAccess: {
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
                    }
                },
            }
        },
    });
}

export function updateApp({id, name, description, logo, allowedURLs, mainUrl}: {id: string, name: string, description: string, logo: string, allowedURLs: string[], mainUrl: string}) {
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
        },
    });
}

export function deleteApp({id}: {id: string}) {
    return prisma.app.delete({
        where: {
            id,
        },
    });
}

export function listAppSessions({sessionId}: {sessionId: string}) {
    return prisma.userAppSession.findMany({
        where: {
            sessionId,
        },
    });
}

export function createAppSession({userAppAccessId, sessionId}: {userAppAccessId: string, sessionId: string}) {
    return prisma.userAppSession.create({
        data: {
            userAppAccessId,
            sessionId,
        },
    });
}

export function deleteAppSession({id}: {id: string}) {
    return prisma.userAppSession.delete({
        where: {
            id,
        },
    });
}

export async function setUserDisabled({id, disabled}: {id: string, disabled: boolean}) {
    const user = await prisma.user.update({
        where: {
            id,
        },
        data: {
            disabled,
        },
    });
    if (disabled) {
        const sessions = await listSessions({userId: id});
        for (const session of sessions) {
            await deleteSession({sessionId: session.id});
        }
    }
    return user;
}

export async function setTenantLogo({id, logo}: {id: string, logo: string}) {
    return prisma.tenant.update({
        where: {
            id,
        },
        data: {
            logo,
        },
    });
}

export async function setTenantColor({id, color}: {id: string, color: string}) {
    return prisma.tenant.update({
        where: {
            id,
        },
        data: {
            color,
        },
    });
}

export async function setTenantColorContrast({id, colorContrast}: {id: string, colorContrast: string}) {
    return prisma.tenant.update({
        where: {
            id,
        },
        data: {
            colorContrast,
        },
    });
}

export async function setTenantDescription({id, description}: {id: string, description: string}) {
    return prisma.tenant.update({
        where: {
            id,
        },
        data: {
            description,
        },
    });
}

