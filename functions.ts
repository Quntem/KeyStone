import { DeviceHardwareType, DeviceSoftwareType, GroupType, MagicGroupConditionAttributeType, MagicGroupConditionOperatorType, MagicGroupConditionTargetType, PrismaClient, Role, TenantType } from "./generated/prisma/index.js";
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

async function syncUserDepartments(userId: string, departmentIds: string[]) {
    const uniqueDepartmentIds = [...new Set(departmentIds.filter(Boolean))];
    await prisma.departmentUser.deleteMany({
        where: {
            userId,
        },
    });
    if (uniqueDepartmentIds.length > 0) {
        await prisma.departmentUser.createMany({
            data: uniqueDepartmentIds.map((departmentId) => ({
                userId,
                departmentId,
            })),
        });
    }
}

async function syncUserOrgRoles(userId: string, orgRoleIds: string[]) {
    const uniqueOrgRoleIds = [...new Set(orgRoleIds.filter(Boolean))];
    await prisma.orgRoleUser.deleteMany({
        where: {
            userId,
        },
    });
    if (uniqueOrgRoleIds.length > 0) {
        await prisma.orgRoleUser.createMany({
            data: uniqueOrgRoleIds.map((orgRoleId) => ({
                userId,
                orgRoleId,
            })),
        });
    }
}

export async function createUser({
    email,
    password,
    name,
    tenantId,
    username,
    role,
    domainId,
    locationId,
    departmentIds,
    orgRoleIds,
    tags,
}: {
    email: string;
    password: string;
    name: string;
    tenantId?: string;
    username: string;
    role: string;
    domainId?: string;
    locationId?: string | null;
    departmentIds?: string[];
    orgRoleIds?: string[];
    tags?: string[];
}) {
    if (!tenantId) {
        throw new Error("Tenant is required");
    }
    var users = await prisma.user.findMany({
        where: {
            tenantId,
            username,
        },
    });
    if (users.length > 0) {
        throw new Error("User already exists");
    }
    const user = await prisma.user.create({
        data: {
            email,
            password: hashPassword(password),
            name,
            role: role == "ADMIN" ? Role.ADMIN : role == "USER" ? Role.USER : role == "SERVICE" ? Role.SERVICE : Role.USER,
            tenantId,
            username,
            domainId,
            locationId: locationId || null,
            tags: tags ?? [],
        },
    });
    if (departmentIds && departmentIds.length > 0) {
        await syncUserDepartments(user.id, departmentIds);
    }
    if (orgRoleIds && orgRoleIds.length > 0) {
        await syncUserOrgRoles(user.id, orgRoleIds);
    }
    await evaluateMagicGroupsForUser({ userId: user.id });
    return user;
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

export async function updateUser({
    id,
    tenantId,
    name,
    email,
    username,
    role,
    domainId,
    locationId,
    departmentIds,
    orgRoleIds,
    tags,
}: {
    id: string;
    tenantId?: string;
    name: string;
    email: string;
    username: string;
    role: string;
    domainId: string;
    locationId?: string | null;
    departmentIds?: string[];
    orgRoleIds?: string[];
    tags?: string[];
}) {
    const existingUser = await prisma.user.findUnique({
        where: {
            id,
        },
        select: {
            tenantId: true,
        },
    });
    if (!existingUser) {
        throw new Error("User not found");
    }
    if (tenantId && existingUser.tenantId !== tenantId) {
        throw new Error("User not found");
    }
    if (locationId) {
        const location = await prisma.location.findUnique({
            where: {
                id: locationId,
            },
            select: {
                tenantId: true,
            },
        });
        if (!location || location.tenantId !== existingUser.tenantId) {
            throw new Error("Location not found");
        }
    }
    if (departmentIds && departmentIds.length > 0) {
        const departments = await prisma.department.findMany({
            where: {
                id: {
                    in: [...new Set(departmentIds.filter(Boolean))],
                },
                tenantId: existingUser.tenantId ?? undefined,
            },
            select: {
                id: true,
            },
        });
        if (departments.length !== [...new Set(departmentIds.filter(Boolean))].length) {
            throw new Error("Department not found");
        }
    }
    if (orgRoleIds && orgRoleIds.length > 0) {
        const orgRoles = await prisma.orgRole.findMany({
            where: {
                id: {
                    in: [...new Set(orgRoleIds.filter(Boolean))],
                },
            },
            select: {
                id: true,
            },
        });
        if (orgRoles.length !== [...new Set(orgRoleIds.filter(Boolean))].length) {
            throw new Error("Org role not found");
        }
    }
    const user = await prisma.user.update({
        where: {
            id,
        },
        data: {
            name,
            email,
            username,
            role: role == "ADMIN" ? Role.ADMIN : role == "USER" ? Role.USER : role == "SERVICE" ? Role.SERVICE : Role.USER,
            domainId,
            locationId: locationId === undefined ? undefined : locationId || null,
            tags: tags ?? undefined,
        },
    });
    if (departmentIds) {
        await syncUserDepartments(user.id, departmentIds);
    }
    if (orgRoleIds) {
        await syncUserOrgRoles(user.id, orgRoleIds);
    }
    await evaluateMagicGroupsForUser({ userId: user.id });
    return user;
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

export async function createSession({ userId, password, infiniteSession }: { userId: string, password: string, infiniteSession: boolean }) {
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
                expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 100)),
            },
        });
    } else {
        if (infiniteSession) {
            return await prisma.session.create({
                data: {
                    userId,
                    expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 100)),
                },
            });
        } else {
            return await prisma.session.create({
                data: {
                    userId,
                }
            });
        }
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
            departments: {
                include: {
                    department: true,
                },
            },
            orgRoles: {
                include: {
                    orgRole: true,
                },
            },
            location: true,
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
            location: true,
            departments: {
                include: {
                    department: true,
                },
            },
            orgRoles: {
                include: {
                    orgRole: true,
                },
            },
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
            location: true,
            departments: {
                include: {
                    department: true,
                },
            },
            orgRoles: {
                include: {
                    orgRole: true,
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
    await evaluateMagicGroupsForUser({ userId: user.id });
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
            conditions: true,
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

export async function updateGroup({ id, name, description, groupname, type }: { id: string, name: string, description?: string, groupname: string, type?: GroupType }) {
    const existing = await prisma.group.findUnique({
        where: {
            id,
        },
        select: {
            type: true,
        },
    });
    if (!existing) {
        throw new Error("Group not found");
    }
    if (type && type !== existing.type) {
        throw new Error("Group type cannot be changed after creation");
    }
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

export async function listDepartments({ tenantId }: { tenantId: string }) {
    return await prisma.department.findMany({
        where: {
            tenantId,
        },
        include: {
            _count: {
                select: {
                    users: true,
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });
}

export async function createDepartment({ tenantId, name }: { tenantId: string, name: string }) {
    return await prisma.department.create({
        data: {
            tenantId,
            name,
        },
    });
}

export async function updateDepartment({ id, tenantId, name }: { id: string, tenantId: string, name: string }) {
    const department = await prisma.department.findUnique({
        where: {
            id,
        },
        select: {
            tenantId: true,
        },
    });
    if (!department || department.tenantId !== tenantId) {
        throw new Error("Department not found");
    }
    return await prisma.department.update({
        where: {
            id,
        },
        data: {
            name,
        },
    });
}

export async function deleteDepartment({ id, tenantId }: { id: string, tenantId: string }) {
    const department = await prisma.department.findUnique({
        where: {
            id,
        },
        select: {
            tenantId: true,
        },
    });
    if (!department || department.tenantId !== tenantId) {
        throw new Error("Department not found");
    }
    await prisma.departmentUser.deleteMany({
        where: {
            departmentId: id,
        },
    });
    return await prisma.department.delete({
        where: {
            id,
        },
    });
}

export async function listLocations({ tenantId }: { tenantId: string }) {
    return await prisma.location.findMany({
        where: {
            tenantId,
        },
        include: {
            _count: {
                select: {
                    users: true,
                    devices: true,
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });
}

export async function createLocation({ tenantId, name }: { tenantId: string, name: string }) {
    return await prisma.location.create({
        data: {
            tenantId,
            name,
        },
    });
}

export async function updateLocation({ id, tenantId, name }: { id: string, tenantId: string, name: string }) {
    const location = await prisma.location.findUnique({
        where: {
            id,
        },
        select: {
            tenantId: true,
        },
    });
    if (!location || location.tenantId !== tenantId) {
        throw new Error("Location not found");
    }
    return await prisma.location.update({
        where: {
            id,
        },
        data: {
            name,
        },
    });
}

export async function deleteLocation({ id, tenantId }: { id: string, tenantId: string }) {
    const location = await prisma.location.findUnique({
        where: {
            id,
        },
        select: {
            tenantId: true,
        },
    });
    if (!location || location.tenantId !== tenantId) {
        throw new Error("Location not found");
    }
    await prisma.user.updateMany({
        where: {
            locationId: id,
        },
        data: {
            locationId: null,
        },
    });
    await prisma.device.updateMany({
        where: {
            locationId: id,
        },
        data: {
            locationId: null,
        },
    });
    return await prisma.location.delete({
        where: {
            id,
        },
    });
}

export async function listOrgRoles() {
    return await prisma.orgRole.findMany({
        include: {
            _count: {
                select: {
                    users: true,
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });
}

export async function createOrgRole({ name }: { name: string }) {
    return await prisma.orgRole.create({
        data: {
            name,
        },
    });
}

export async function updateOrgRole({ id, name }: { id: string, name: string }) {
    return await prisma.orgRole.update({
        where: {
            id,
        },
        data: {
            name,
        },
    });
}

export async function deleteOrgRole({ id }: { id: string }) {
    await prisma.orgRoleUser.deleteMany({
        where: {
            orgRoleId: id,
        },
    });
    return await prisma.orgRole.delete({
        where: {
            id,
        },
    });
}

export async function listMagicGroupConditions({ groupId }: { groupId: string }) {
    return await prisma.magicGroupCondition.findMany({
        where: {
            groupId,
        },
        orderBy: {
            id: "asc",
        },
    });
}

export async function createMagicGroupCondition({
    groupId,
    targetType,
    attribute,
    operator,
    value,
}: {
    groupId: string;
    targetType: MagicGroupConditionTargetType;
    attribute: MagicGroupConditionAttributeType;
    operator: MagicGroupConditionOperatorType;
    value: string;
}) {
    const group = await prisma.group.findUnique({
        where: {
            id: groupId,
        },
        select: {
            id: true,
            type: true,
        },
    });
    if (!group) {
        throw new Error("Group not found");
    }
    if (group.type !== GroupType.Magic) {
        throw new Error("Magic group conditions can only be added to magic groups");
    }
    const condition = await prisma.magicGroupCondition.create({
        data: {
            groupId,
            targetType,
            attribute,
            operator,
            value,
        },
    });
    await evaluateMagicGroupsForGroup({ groupId });
    return condition;
}

export async function updateMagicGroupCondition({
    id,
    targetType,
    attribute,
    operator,
    value,
}: {
    id: string;
    targetType?: MagicGroupConditionTargetType;
    attribute?: MagicGroupConditionAttributeType;
    operator?: MagicGroupConditionOperatorType;
    value?: string;
}) {
    const existing = await prisma.magicGroupCondition.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            groupId: true,
            group: {
                select: {
                    type: true,
                },
            },
        },
    });
    if (!existing) {
        throw new Error("Magic group condition not found");
    }
    if (existing.group.type !== GroupType.Magic) {
        throw new Error("Magic group conditions can only be updated on magic groups");
    }
    const condition = await prisma.magicGroupCondition.update({
        where: {
            id,
        },
        data: {
            targetType,
            attribute,
            operator,
            value,
        },
    });
    await evaluateMagicGroupsForGroup({ groupId: existing.groupId });
    return condition;
}

export async function deleteMagicGroupCondition({ id }: { id: string }) {
    const existing = await prisma.magicGroupCondition.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            groupId: true,
            group: {
                select: {
                    type: true,
                },
            },
        },
    });
    if (!existing) {
        throw new Error("Magic group condition not found");
    }
    if (existing.group.type !== GroupType.Magic) {
        throw new Error("Magic group conditions can only be deleted from magic groups");
    }
    const condition = await prisma.magicGroupCondition.delete({
        where: {
            id,
        },
    });
    await evaluateMagicGroupsForGroup({ groupId: existing.groupId });
    return condition;
}

export function getGroupById({ id }: { id: string }) {
    return prisma.group.findUnique({
        where: {
            id,
        },
        include: {
            conditions: true,
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

async function addUserToGroupMembership({ userId, groupId }: { userId: string, groupId: string }) {
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

async function removeUserFromGroupMembership({ userId, groupId }: { userId: string, groupId: string }) {
    return await prisma.groupUser.delete({
        where: {
            userId_groupId: {
                groupId,
                userId,
            },
        },
    });
}

export async function addUserToGroup({ userId, groupId }: { userId: string, groupId: string }) {
    const group = await prisma.group.findUnique({
        where: {
            id: groupId,
        },
        select: {
            type: true,
        },
    });
    if (group?.type === GroupType.Magic) {
        throw new Error("Users cannot be manually added to magic groups");
    }
    return await addUserToGroupMembership({ userId, groupId });
}

export async function removeUserFromGroup({ userId, groupId }: { userId: string, groupId: string }) {
    const group = await prisma.group.findUnique({
        where: {
            id: groupId,
        },
        select: {
            type: true,
        },
    });
    if (group?.type === GroupType.Magic) {
        throw new Error("Users cannot be manually removed from magic groups");
    }
    return await removeUserFromGroupMembership({ userId, groupId });
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

export async function createDevice({ name, hardwareType, softwareType, os, osVersion, assignedTo, mdmServerId, extraInfo, displayName, tenantId, isSelfEnrolled, enrolledById, groups, locationId, tags }: { name: string, hardwareType: DeviceHardwareType, softwareType: DeviceSoftwareType, os: string, osVersion: string, assignedTo: string, mdmServerId: string | null, extraInfo: any, displayName: string, tenantId: string, isSelfEnrolled: boolean, enrolledById: string, groups?: string[], locationId?: string | null, tags?: string[] }) {
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
            assignedTo: assignedTo || (isSelfEnrolled ? enrolledById : null),
            mdmServerId,
            extraInfo,
            isSelfEnrolled,
            enrolledById,
            lastCheckIn: new Date(),
            locationId: locationId || null,
            tags: tags ?? [],
            groups: {
                create: (groups || []).map((group: any) => ({
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
            location: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    email: true,
                    role: true,
                    departments: {
                        include: {
                            department: true,
                        },
                    },
                    orgRoles: {
                        include: {
                            orgRole: true,
                        },
                    },
                    location: true,
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
            await evaluateMagicGroupsForDevice({ deviceId: device.id });
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
        const responseData: any = await response.json();
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
                    location: true,
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
            await evaluateMagicGroupsForDevice({ deviceId: updatedDevice.id });
            return updatedDevice;
        }
    }
    await evaluateMagicGroupsForDevice({ deviceId: device.id });
    return device;
}

export async function updateDevice({ id, name, hardwareType, softwareType, os, osVersion, assignedTo, mdmServerId, extraInfo, displayName, lastCheckIn, locationId, tags }: { id: string, name?: string, hardwareType?: DeviceHardwareType, softwareType?: DeviceSoftwareType, os?: string, osVersion?: string, assignedTo?: string, mdmServerId?: string, extraInfo?: any, displayName?: string, lastCheckIn?: Date, locationId?: string | null, tags?: string[] }) {
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
            location: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    email: true,
                    role: true,
                    departments: {
                        include: {
                            department: true,
                        },
                    },
                    orgRoles: {
                        include: {
                            orgRole: true,
                        },
                    },
                    location: true,
                },
            },
        },
    });
    if (!device) {
        return null;
    }
    if (locationId) {
        const location = await prisma.location.findUnique({
            where: {
                id: locationId,
            },
            select: {
                tenantId: true,
            },
        });
        if (!location || location.tenantId !== device.tenantId) {
            return null;
        }
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
            lastCheckIn,
            locationId: locationId === undefined ? undefined : locationId || null,
            tags: tags ?? undefined,
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
    await evaluateMagicGroupsForDevice({ deviceId: updatedDevice.id });
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
            location: true,
            tenant: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    email: true,
                    role: true,
                    departments: {
                        include: {
                            department: true,
                        },
                    },
                    orgRoles: {
                        include: {
                            orgRole: true,
                        },
                    },
                    location: true,
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
            location: true,
            tenant: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    email: true,
                    role: true,
                    departments: {
                        include: {
                            department: true,
                        },
                    },
                    orgRoles: {
                        include: {
                            orgRole: true,
                        },
                    },
                    location: true,
                },
            },
        },
    });
}

async function addDeviceToGroupMembership({ deviceId, groupId }: { deviceId: string, groupId: string }) {
    return await prisma.deviceGroup.create({
        data: {
            deviceId,
            groupId,
        },
        include: {
            group: true,
            device: true,
        },
    });
}

async function removeDeviceFromGroupMembership({ deviceId, groupId }: { deviceId: string, groupId: string }) {
    return await prisma.deviceGroup.delete({
        where: {
            deviceId_groupId: {
                deviceId,
                groupId,
            },
        },
    });
}

export async function addDeviceToGroup({ deviceId, groupId }: { deviceId: string, groupId: string }) {
    const deviceGroup = await addDeviceToGroupMembership({ deviceId, groupId });
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
    const deviceGroup = await removeDeviceFromGroupMembership({ deviceId, groupId });
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

function matchesMagicGroupConditionForDevice(device: Awaited<ReturnType<typeof getDeviceById>>, condition: {
    attribute: MagicGroupConditionAttributeType;
    operator: MagicGroupConditionOperatorType;
    value: string;
}) {
    if (!device) {
        return false;
    }

    const expectedValue = normalizeMagicGroupValue(condition.value);

    switch (condition.attribute) {
        case MagicGroupConditionAttributeType.Departments:
            return matchesMagicGroupStringList(
                device.user?.departments?.map((department) => normalizeMagicGroupValue(department.department.name)) ?? [],
                expectedValue,
                condition.operator,
            );
        case MagicGroupConditionAttributeType.Tags:
            return matchesMagicGroupStringList(
                device.tags?.map((tag) => normalizeMagicGroupValue(tag)) ?? [],
                expectedValue,
                condition.operator,
            );
        case MagicGroupConditionAttributeType.Location:
            return matchesMagicGroupString(
                normalizeMagicGroupValue(device.location?.name),
                expectedValue,
                condition.operator,
            );
        default:
            return false;
    }
}

export async function evaluateMagicGroupsForDevice({ deviceId }: { deviceId: string }) {
    const device = await getDeviceById({ id: deviceId });
    if (!device) {
        return;
    }

    const groups = await prisma.group.findMany({
        where: {
            type: GroupType.Magic,
        },
        include: {
            conditions: true,
        },
    });

    for (const group of groups) {
        const relevantConditions = group.conditions.filter(
            (condition) =>
                condition.targetType === MagicGroupConditionTargetType.Device ||
                condition.targetType === MagicGroupConditionTargetType.Both,
        );
        const shouldBeMember =
            group.includeAll === MagicGroupConditionTargetType.Device ||
            group.includeAll === MagicGroupConditionTargetType.Both ||
            (relevantConditions.length > 0 &&
                relevantConditions.every((condition) => matchesMagicGroupConditionForDevice(device, condition)));
        const isMember = device.groups.some((deviceGroup) => deviceGroup.groupId === group.id);

        if (shouldBeMember && !isMember) {
            await addDeviceToGroupMembership({ deviceId, groupId: group.id });
        } else if (!shouldBeMember && isMember) {
            await removeDeviceFromGroupMembership({ deviceId, groupId: group.id });
        }
    }
}

export async function evaluateMagicGroupsForGroup({ groupId }: { groupId: string }) {
    const group = await prisma.group.findUnique({
        where: {
            id: groupId,
        },
        include: {
            tenant: true,
            conditions: true,
        },
    });

    if (!group || group.type !== GroupType.Magic) {
        return;
    }

    const userTargets = await prisma.user.findMany({
        where: {
            tenantId: group.tenantId,
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
            departments: {
                include: {
                    department: true,
                },
            },
            orgRoles: {
                include: {
                    orgRole: true,
                },
            },
            location: true,
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

    const userConditions = group.conditions.filter(
        (condition) =>
            condition.targetType === MagicGroupConditionTargetType.User ||
            condition.targetType === MagicGroupConditionTargetType.Both,
    );
    for (const user of userTargets) {
        const shouldBeMember =
            group.includeAll === MagicGroupConditionTargetType.User ||
            group.includeAll === MagicGroupConditionTargetType.Both ||
            (userConditions.length > 0 &&
                userConditions.every((condition) => matchesMagicGroupCondition(user as Awaited<ReturnType<typeof getUserById>>, condition)));
        const isMember = user.groups.some((userGroup) => userGroup.groupId === group.id);

        if (shouldBeMember && !isMember) {
            await addUserToGroupMembership({ userId: user.id, groupId: group.id });
        } else if (!shouldBeMember && isMember) {
            await removeUserFromGroupMembership({ userId: user.id, groupId: group.id });
        }
    }

    const deviceTargets = await prisma.device.findMany({
        where: {
            tenantId: group.tenantId,
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
                    departments: {
                        include: {
                            department: true,
                        },
                    },
                    orgRoles: {
                        include: {
                            orgRole: true,
                        },
                    },
                    location: true,
                },
            },
        },
    });

    const deviceConditions = group.conditions.filter(
        (condition) =>
            condition.targetType === MagicGroupConditionTargetType.Device ||
            condition.targetType === MagicGroupConditionTargetType.Both,
    );
    for (const device of deviceTargets) {
        const shouldBeMember =
            group.includeAll === MagicGroupConditionTargetType.Device ||
            group.includeAll === MagicGroupConditionTargetType.Both ||
            (deviceConditions.length > 0 &&
                deviceConditions.every((condition) => matchesMagicGroupConditionForDevice(device as Awaited<ReturnType<typeof getDeviceById>>, condition)));
        const isMember = device.groups.some((deviceGroup) => deviceGroup.groupId === group.id);

        if (shouldBeMember && !isMember) {
            await addDeviceToGroupMembership({ deviceId: device.id, groupId: group.id });
        } else if (!shouldBeMember && isMember) {
            await removeDeviceFromGroupMembership({ deviceId: device.id, groupId: group.id });
        }
    }
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

export async function getMdmServerById({ id }: { id: string }) {
    return await prisma.mdmServer.findUnique({
        where: {
            id,
        },
    });
}

function normalizeMagicGroupValue(value: unknown) {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value).trim();
}

function parseMagicGroupStatus(value: string) {
    const normalizedValue = value.trim().toLowerCase();
    if (["active", "enabled", "true", "1"].includes(normalizedValue)) {
        return true;
    }
    if (["inactive", "disabled", "false", "0"].includes(normalizedValue)) {
        return false;
    }
    return null;
}

function matchesMagicGroupString(
    actual: string,
    expected: string,
    operator: MagicGroupConditionOperatorType,
) {
    switch (operator) {
        case MagicGroupConditionOperatorType.Equals:
            return actual === expected;
        case MagicGroupConditionOperatorType.NotEquals:
            return actual !== expected;
        case MagicGroupConditionOperatorType.Contains:
            return actual.includes(expected);
        case MagicGroupConditionOperatorType.NotContains:
            return !actual.includes(expected);
        case MagicGroupConditionOperatorType.StartsWith:
            return actual.startsWith(expected);
        case MagicGroupConditionOperatorType.EndsWith:
            return actual.endsWith(expected);
        case MagicGroupConditionOperatorType.Includes:
            return actual.includes(expected);
        default:
            return false;
    }
}

function matchesMagicGroupStringList(
    actualValues: string[],
    expected: string,
    operator: MagicGroupConditionOperatorType,
) {
    switch (operator) {
        case MagicGroupConditionOperatorType.Equals:
            return actualValues.some((value) => value === expected);
        case MagicGroupConditionOperatorType.NotEquals:
            return !actualValues.some((value) => value === expected);
        case MagicGroupConditionOperatorType.Contains:
            return actualValues.some((value) => value.includes(expected));
        case MagicGroupConditionOperatorType.NotContains:
            return !actualValues.some((value) => value.includes(expected));
        case MagicGroupConditionOperatorType.StartsWith:
            return actualValues.some((value) => value.startsWith(expected));
        case MagicGroupConditionOperatorType.EndsWith:
            return actualValues.some((value) => value.endsWith(expected));
        case MagicGroupConditionOperatorType.Includes:
            return actualValues.some((value) => value === expected);
        default:
            return false;
    }
}

function matchesMagicGroupCondition(user: Awaited<ReturnType<typeof getUserById>>, condition: {
    attribute: MagicGroupConditionAttributeType;
    operator: MagicGroupConditionOperatorType;
    value: string;
}) {
    if (!user) {
        return false;
    }

    const expectedValue = normalizeMagicGroupValue(condition.value);

    switch (condition.attribute) {
        case MagicGroupConditionAttributeType.Email:
            return matchesMagicGroupString(
                normalizeMagicGroupValue(user.email).toLowerCase(),
                expectedValue.toLowerCase(),
                condition.operator,
            );
        case MagicGroupConditionAttributeType.Departments:
            return matchesMagicGroupStringList(
                user.departments?.map((department) => normalizeMagicGroupValue(department.department.name)) ?? [],
                expectedValue,
                condition.operator,
            );
        case MagicGroupConditionAttributeType.Tags:
            return matchesMagicGroupStringList(
                user.tags?.map((tag) => normalizeMagicGroupValue(tag)) ?? [],
                expectedValue,
                condition.operator,
            );
        case MagicGroupConditionAttributeType.OrgRole:
            return matchesMagicGroupStringList(
                user.orgRoles?.map((orgRole) => normalizeMagicGroupValue(orgRole.orgRole.name)) ?? [],
                expectedValue,
                condition.operator,
            );
        case MagicGroupConditionAttributeType.Status: {
            const actualStatus = user.disabled ? "disabled" : "active";
            const expectedStatus = parseMagicGroupStatus(expectedValue);
            if (expectedStatus === null) {
                return false;
            }
            const expectedStatusText = expectedStatus ? "active" : "disabled";
            return matchesMagicGroupString(actualStatus, expectedStatusText, condition.operator);
        }
        case MagicGroupConditionAttributeType.Location:
            return matchesMagicGroupString(
                normalizeMagicGroupValue(user.location?.name),
                expectedValue,
                condition.operator,
            );
        default:
            return false;
    }
}

export async function evaluateMagicGroupsForUser({ userId }: { userId: string }) {
    const user = await getUserById({id: userId})
    if (!user) {
        return;
    }

    const groups = await prisma.group.findMany({
        where: {
            type: GroupType.Magic,
        },
        include: {
            conditions: true,
        }
    })
    for (const group of groups) {
        const relevantConditions = group.conditions.filter(
            (condition) =>
                condition.targetType === MagicGroupConditionTargetType.User ||
                condition.targetType === MagicGroupConditionTargetType.Both,
        );
        const shouldBeMember =
            group.includeAll === MagicGroupConditionTargetType.User ||
            group.includeAll === MagicGroupConditionTargetType.Both ||
            (relevantConditions.length > 0 &&
                relevantConditions.every((condition) => matchesMagicGroupCondition(user, condition)));
        const isMember = user.groups.some((userGroup) => userGroup.groupId === group.id);

        if (shouldBeMember && !isMember) {
            await addUserToGroup({ userId, groupId: group.id });
        } else if (!shouldBeMember && isMember) {
            await removeUserFromGroup({ userId, groupId: group.id });
        }
    }
}
