import express from "express";
import cors from "cors";
var router = express.Router();

import { listTenantUsers, getUserById, listChildTenants, createUser, setUserDisabled, setTenantLogo, setTenantDescription, setTenantColorContrast, setTenantColor, listTenantApps, createApp, updateApp, deleteApp, grantUserAppAccess, grantGroupAppAccess, getUserIdByUsername, revokeUserAppAccess, getUserAppAccess, updateUser, SetUserPassword, verifyDomain, listDomains, deleteDomain, createDomain, listGroups, createGroup, deleteGroup, updateGroup, addUserToGroup, removeUserFromGroup, setTenantDisplayName, AddTenantToApp, getAppById, UpgradeToFullTenant, getGroupById, getDomainById, setTenantGroupCreationPermition, listDevices, createDevice, updateDevice, deleteDevice, addDeviceToGroup, updateMDMServer, deleteMDMServer, listMDMServers, createMDMServer, getDeviceById, getDeviceByDeviceName, removeDeviceFromGroup, getMdmServerById, listMagicGroupConditions, createMagicGroupCondition, updateMagicGroupCondition, deleteMagicGroupCondition, listDepartments, listLocations, listOrgRoles, createDepartment, updateDepartment, deleteDepartment, createLocation, updateLocation, deleteLocation, createOrgRole, updateOrgRole, deleteOrgRole, evaluateMagicGroupsForUser, evaluateMagicGroupsForGroup, revokeGroupAppAccess, getGroupAppAccessByGroupIdAndAppId, getGroupAppAccess } from "../functions.ts";
import { requireAuth, requireRole } from "../webfunctions.ts";

router.use(express.json());

router.use(cors({
    credentials: true,
    origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL_2, process.env.FRONTEND_URL_3, process.env.FRONTEND_URL_4, process.env.FRONTEND_URL_5, process.env.FRONTEND_URL_6, process.env.FRONTEND_URL_7, process.env.FRONTEND_URL_8, process.env.FRONTEND_URL_9, process.env.FRONTEND_URL_10],
}));

router.get("/users", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    var users = await listTenantUsers({ tenantId: req.auth.tenantId })
    //console.log("found users");
    res.json(users);
});

router.get("/user/:id/get", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    var user = await getUserById({ id: req.params.id });
    res.json(user);
});

router.get("/tenants", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    var users = await listChildTenants({ tenantId: req.auth.tenantId })
    //console.log("found users");
    res.json(users);
});

router.post("/user/:id/setdisabled", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await setUserDisabled({ id: req.params.id, disabled: req.body.disabled });
        res.json({ success: true });
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.get("/user/username/:username", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    var id = await getUserIdByUsername({ tenantId: req.auth.tenantId, username: req.params.username });
    if (!id) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    var user = await getUserById({ id: id.id });
    res.json(user);
});

router.post("/user", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var user = await createUser({
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
            tenantId: req.auth.tenantId,
            username: req.body.username,
            role: req.body.role,
            domainId: req.body.domainId,
            locationId: req.body.locationId,
            departmentIds: req.body.departmentIds,
            orgRoleIds: req.body.orgRoleIds,
            tags: req.body.tags,
        });
        await evaluateMagicGroupsForUser({ userId: user.id });
        res.json(user);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.patch("/user/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var user = await updateUser({
            id: req.params.id,
            tenantId: req.auth.tenantId,
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            role: req.body.role,
            domainId: req.body.domainId,
            locationId: req.body.locationId,
            departmentIds: req.body.departmentIds,
            orgRoleIds: req.body.orgRoleIds,
            tags: req.body.tags,
        });
        await evaluateMagicGroupsForUser({ userId: user.id });
        res.json(user);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.post("/user/:id/setpassword", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await SetUserPassword({ userId: req.params.id, password: req.body.password });
        res.json({ success: true });
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.post("/tenant/logo", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await setTenantLogo({ id: req.auth.tenantId, logo: req.body.logo });
        res.json({ success: true });
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.post("/tenant/color", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await setTenantColor({ id: req.auth.tenantId, color: req.body.color });
        res.json({ success: true });
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.post("/tenant/colorcontrast", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await setTenantColorContrast({ id: req.auth.tenantId, colorContrast: req.body.colorContrast });
        res.json({ success: true });
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.post("/tenant/description", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await setTenantDescription({ id: req.auth.tenantId, description: req.body.description });
        res.json({ success: true });
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.post("/tenant/displayname", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await setTenantDisplayName({ id: req.auth.tenantId, displayName: req.body.displayName });
        res.json({ success: true });
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.post("/tenant/setGroupCreationPermition", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await setTenantGroupCreationPermition({ id: req.auth.tenantId, allowGroupCreation: req.body.allowGroupCreation });
        res.json({ success: true });
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.get("/apps", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    var apps = await listTenantApps({ tenantId: req.auth.tenantId })
    apps.forEach((app) => {
        if (app.tenantId !== req.auth.tenantId) {
            app.secret = "";
        }
    });
    //console.log("found apps");
    res.json(apps);
});

router.post("/app", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var app = await createApp({ name: req.body.name, description: req.body.description, logo: req.body.logo, allowedURLs: req.body.allowedURLs, tenantId: req.auth.tenantId, mainUrl: req.body.mainUrl });
        res.json(app);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.post("/app/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var app = await updateApp({ id: req.params.id, name: req.body.name, description: req.body.description, logo: req.body.logo, allowedURLs: req.body.allowedURLs, mainUrl: req.body.mainUrl, availableForExternal: req.body.availableForExternal });
        res.json(app);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.get("/app/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        const apps = await listTenantApps({ tenantId: req.auth.tenantId });
        var app = apps.find((item) => item.id === req.params.id);
        if (!app) {
            res.status(404).json({ error: "App not found" });
            return;
        }
        res.json(app);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.delete("/app/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await deleteApp({ id: req.params.id });
        res.json({ success: true });
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.post("/app/:id/userappaccess", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        const app = await getAppById({ id: req.params.id, includeExternal: true });
        const user = await getUserById({ id: req.body.userId });
        if (!app) {
            res.status(404).json({ error: "App not found" });
            return;
        }
        if (app.tenantId !== req.auth.tenantId && !app.inExternalTenants.some((ext) => ext.tenantId === req.auth.tenantId)) {
            res.status(400).json({ error: "App does not belong to this tenant" });
            return;
        }
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        if (user.tenantId !== req.auth.tenantId) {
            res.status(400).json({ error: "User does not belong to this tenant" });
            return;
        }
        const userAppAccess = await grantUserAppAccess({ userId: req.body.userId, appId: req.params.id });
        res.json(userAppAccess);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.post("/app/:id/groupappaccess", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        const app = await getAppById({ id: req.params.id, includeExternal: true });
        const group = await getGroupById({ id: req.body.groupId });
        if (!app) {
            res.status(404).json({ error: "App not found" });
            return;
        }
        if (!group) {
            res.status(404).json({ error: "Group not found" });
            return;
        }
        if (group.tenantId !== req.auth.tenantId) {
            res.status(400).json({ error: "Group does not belong to this tenant" });
            return;
        }
        if (app.tenantId !== req.auth.tenantId && !app.inExternalTenants.some((ext) => ext.tenantId === req.auth.tenantId)) {
            res.status(400).json({ error: "App does not belong to this tenant" });
            return;
        }
        const existing = await getGroupAppAccessByGroupIdAndAppId({ groupId: req.body.groupId, appId: req.params.id });
        if (existing) {
            res.json(existing);
            return;
        }
        const groupAppAccess = await grantGroupAppAccess({ groupId: req.body.groupId, appId: req.params.id });
        res.json(groupAppAccess);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.delete("/app/:id/userappaccess/:userAppAccessId", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        const userAppAccess = await getUserAppAccess({ id: req.params.userAppAccessId });
        const user = await getUserById({ id: userAppAccess?.userId });
        if (!userAppAccess) {
            res.status(404).json({ error: "User app access not found" });
            return;
        }
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        if (user.tenantId !== req.auth.tenantId) {
            res.status(400).json({ error: "User does not belong to this tenant" });
            return;
        }
        if (userAppAccess.app.id !== req.params.id) {
            res.status(400).json({ error: "User app access does not belong to this app" });
            return;
        }
        await revokeUserAppAccess({ id: req.params.userAppAccessId });
        res.json({ success: true });
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.delete("/app/:id/groupappaccess/:groupAppAccessId", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        const groupAppAccess = await getGroupAppAccess({ id: req.params.groupAppAccessId });
        if (!groupAppAccess) {
            res.status(404).json({ error: "Group app access not found" });
            return;
        }
        if (groupAppAccess.app.id !== req.params.id) {
            res.status(400).json({ error: "Group app access does not belong to this app" });
            return;
        }
        if (groupAppAccess.group.tenantId !== req.auth.tenantId) {
            res.status(400).json({ error: "Group does not belong to this tenant" });
            return;
        }
        await revokeGroupAppAccess({ id: req.params.groupAppAccessId });
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.post("/domain", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var domain = await createDomain({ name: req.body.domain, creatorId: req.auth.userId, tenantId: req.auth.tenantId });
        res.json(domain);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.delete("/domain/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await deleteDomain({ id: req.params.id });
        res.json({ success: true });
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.get("/domains", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var domains = await listDomains({ tenantId: req.auth.tenantId });
        res.json(domains);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.get("/domain/:id/verify", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var domain = await verifyDomain({ domainId: req.params.id });
        res.json(domain);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.get("/domain/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var domain = await getDomainById({ id: req.params.id });
        res.json(domain);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.get("/groups", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var groups = await listGroups({ tenantId: req.auth.tenantId });
        res.json(groups);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.get("/departments", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        const departments = await listDepartments({ tenantId: req.auth.tenantId });
        res.json(departments);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.post("/departments", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        const department = await createDepartment({ tenantId: req.auth.tenantId, name: req.body.name });
        res.json(department);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.patch("/departments/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        const department = await updateDepartment({ id: req.params.id, tenantId: req.auth.tenantId, name: req.body.name });
        res.json(department);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.delete("/departments/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await deleteDepartment({ id: req.params.id, tenantId: req.auth.tenantId });
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.get("/locations", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        const locations = await listLocations({ tenantId: req.auth.tenantId });
        res.json(locations);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.post("/locations", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        const location = await createLocation({ tenantId: req.auth.tenantId, name: req.body.name });
        res.json(location);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.patch("/locations/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        const location = await updateLocation({ id: req.params.id, tenantId: req.auth.tenantId, name: req.body.name });
        res.json(location);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.delete("/locations/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await deleteLocation({ id: req.params.id, tenantId: req.auth.tenantId });
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.get("/orgroles", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        const orgRoles = await listOrgRoles();
        res.json(orgRoles);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.post("/orgroles", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        const orgRole = await createOrgRole({ name: req.body.name });
        res.json(orgRole);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.patch("/orgroles/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        const orgRole = await updateOrgRole({ id: req.params.id, name: req.body.name });
        res.json(orgRole);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.delete("/orgroles/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await deleteOrgRole({ id: req.params.id });
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.get("/group/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var group = await getGroupById({ id: req.params.id });
        res.json(group);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.get("/group/:id/conditions", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        const conditions = await listMagicGroupConditions({ groupId: req.params.id });
        res.json(conditions);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.post("/group/:id/recalculate", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await evaluateMagicGroupsForGroup({ groupId: req.params.id });
        const group = await getGroupById({ id: req.params.id });
        res.json(group);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.post("/group", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var group = await createGroup({ tenantId: req.auth.tenantId, name: req.body.name, description: req.body.description, groupname: req.body.groupname.trim().toLowerCase().replaceAll(/[^a-z0-9-_]/g, ""), createdBy: req.auth.id, adminCreated: true, type: req.body.type || "Organizational" });
        res.json(group);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.delete("/group/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        await deleteGroup({ id: req.params.id });
        res.json({ success: true });
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.patch("/group/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var group = await updateGroup({ id: req.params.id, name: req.body.name, description: req.body.description, groupname: req.body.groupname.trim().toLowerCase().replaceAll(/[^a-z0-9-_]/g, ""), type: req.body.type });
        res.json(group);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.post("/group/:id/user", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var groupUser = await addUserToGroup({ userId: req.body.userId, groupId: req.params.id });
        res.json(groupUser);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.post("/group/:id/conditions", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        const condition = await createMagicGroupCondition({
            groupId: req.params.id,
            targetType: req.body.targetType,
            attribute: req.body.attribute,
            operator: req.body.operator,
            value: req.body.value,
        });
        res.json(condition);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.post("/group/:id/device", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var groupDevice = await addDeviceToGroup({ deviceId: req.body.deviceId, groupId: req.params.id });
        res.json(groupDevice);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.delete("/group/:id/user", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var groupUser = await removeUserFromGroup({ userId: req.body.userId, groupId: req.params.id });
        res.json(groupUser);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.patch("/group/conditions/:conditionId", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        const condition = await updateMagicGroupCondition({
            id: req.params.conditionId,
            targetType: req.body.targetType,
            attribute: req.body.attribute,
            operator: req.body.operator,
            value: req.body.value,
        });
        res.json(condition);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.delete("/group/conditions/:conditionId", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        const condition = await deleteMagicGroupCondition({ id: req.params.conditionId });
        res.json(condition);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.delete("/group/:id/device", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var groupDevice = await removeDeviceFromGroup({ deviceId: req.body.deviceId, groupId: req.params.id });
        res.json(groupDevice);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.post("/acquireapp/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var app = await getAppById({ id: req.params.id });
        if (!app || app.availableForExternal !== true) {
            res.status(404).json({ error: "App not found or not available for external use" });
            return;
        }
        var appAccess = await AddTenantToApp({ tenantId: req.auth.tenantId, appId: req.params.id });
        res.json(appAccess);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.post("/upgradetofulltenant", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        const domain = req.body.domain;
        var newDomain = await createDomain({ name: domain, creatorId: req.auth.userId, tenantId: req.auth.tenantId });
        var tenant = await UpgradeToFullTenant({ tenantId: req.auth.tenantId });
        res.json(tenant);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.get("/devices", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var devices = await listDevices({ tenantId: req.auth.tenantId });
        res.json(devices);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.post("/device", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var device = await createDevice({ name: req.body.name, hardwareType: req.body.hardwareType, softwareType: req.body.softwareType, os: req.body.os, osVersion: req.body.osVersion, assignedTo: req.body.assignedTo, mdmServerId: req.body.mdmServerId, extraInfo: req.body.extraInfo, displayName: req.body.displayName, tenantId: req.auth.tenantId, isSelfEnrolled: false, enrolledById: req.auth.id, groups: req.body.groups, locationId: req.body.locationId, tags: req.body.tags });
        if (!device) {
            res.status(400).json({ error: "Failed to create device" });
            return;
        }
        // if (req.body.groups) {
        //     for (const groupId of req.body.groups) {
        //         device.groups.push(await addDeviceToGroup({ deviceId: device.id, groupId }));
        //     }
        // }
        res.json(device);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.get("/device/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var device = await getDeviceById({ id: req.params.id });
        res.json(device);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.post("/device/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var device = await updateDevice({ id: req.params.id, name: req.body.name, hardwareType: req.body.hardwareType, softwareType: req.body.softwareType, os: req.body.os, osVersion: req.body.osVersion, assignedTo: req.body.assignedTo, mdmServerId: req.body.mdmServerId, extraInfo: req.body.extraInfo, displayName: req.body.displayName, locationId: req.body.locationId, tags: req.body.tags });
        res.json(device);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.get("/device/devicename/:name", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    var device = await getDeviceByDeviceName({ tenantId: req.auth.tenantId, deviceName: req.params.name });
    if (!device) {
        res.status(404).json({ error: "Device not found" });
        return;
    }
    res.json(device);
});

router.delete("/device/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var device = await deleteDevice({ id: req.params.id });
        res.json(device);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.post("/mdmserver", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var mdmServer = await createMDMServer({ name: req.body.name, tenantId: req.auth.tenantId, url: req.body.url, enrollmentToken: req.body.enrollmentToken, isDefault: req.body.isDefault });
        res.json(mdmServer);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.post("/mdmserver/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var mdmServer = await updateMDMServer({ id: req.params.id, name: req.body.name, tenantId: req.auth.tenantId, url: req.body.url, enrollmentToken: req.body.enrollmentToken, isDefault: req.body.isDefault });
        res.json(mdmServer);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.delete("/mdmserver/:id", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var mdmServer = await deleteMDMServer({ id: req.params.id });
        res.json(mdmServer);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.get("/mdmservers", requireAuth({ redirectTo: "/auth/signin" }), requireRole("ADMIN"), async (req: any, res: any) => {
    try {
        var mdmServers = await listMDMServers({ tenantId: req.auth.tenantId });
        res.json(mdmServers);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.delete("/mdmactions/group/:id/device", async (req: any, res: any) => {
    const mdmserver = await getMdmServerById({ id: req.headers.mdmserverid });
    if (!mdmserver) {
        res.status(404).json({ error: "MDM Server not found" });
        return;
    }
    if (mdmserver.enrollmentToken !== req.headers.authorization) {
        res.status(403).json({ error: "Unauthorized" });
        return;
    }
    const device = await getDeviceById({ id: req.body.deviceId });
    if (!device) {
        res.status(404).json({ error: "Device not found" });
        return;
    }
    if (device.tenantId !== mdmserver.tenantId) {
        res.status(403).json({ error: "Unauthorized" });
        return;
    }
    try {
        var groupDevice = await removeDeviceFromGroup({ deviceId: req.body.deviceId, groupId: req.params.id });
        res.json(groupDevice);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

router.post("/mdmactions/group/:id/device", async (req: any, res: any) => {
    const mdmserver = await getMdmServerById({ id: req.headers.mdmserverid });
    if (!mdmserver) {
        res.status(404).json({ error: "MDM Server not found" });
        return;
    }
    if (mdmserver.enrollmentToken !== req.headers.authorization) {
        res.status(403).json({ error: "Unauthorized" });
        return;
    }
    const device = await getDeviceById({ id: req.body.deviceId });
    if (!device) {
        res.status(404).json({ error: "Device not found" });
        return;
    }
    if (device.tenantId !== mdmserver.tenantId) {
        res.status(403).json({ error: "Unauthorized" });
        return;
    }
    try {
        var groupDevice = await addDeviceToGroup({ deviceId: req.body.deviceId, groupId: req.params.id });
        res.json(groupDevice);
    } catch (e) {
        //console.log(e);
        res.status(400).json({ error: e.message });
    }
});

export { router }
