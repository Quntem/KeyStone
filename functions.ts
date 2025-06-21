import { PrismaClient } from "./generated/prisma/index.js";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

export function hashPassword(password: string) {
    return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hashedPassword: string) {
    return bcrypt.compareSync(password, hashedPassword);
}

export async function createUser({email, password, name, tenantId, username}: {email: string, password: string, name: string, tenantId: string, username: string}) {
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

export function listSessions({userId}: {userId: string}) {
    return prisma.session.findMany({
        where: {
            userId,
        },
    });
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