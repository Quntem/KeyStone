"use client"
import { addDeviceToGroup, AddUserToApp, addUserToGroup, createMagicGroupCondition, CreateApp, CreateGroup, deleteMagicGroupCondition, getDeviceByDeviceName, getGroupById, getUserByUsername, listMagicGroupConditions, recalculateMagicGroup, removeDeviceFromGroup, removeUserFromApp, removeUserFromGroup, updateApp, updateGroup, updateMagicGroupCondition, useAdminAppsList, useDepartmentsList, useLocationsList, useOrgRolesList, useTenantsList, useUsersList } from "@/lib/admin";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender, Row } from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { useEffect, useState } from "react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";
import { CheckIcon, MonitorSmartphoneIcon, PlusIcon, SaveIcon, SearchIcon, XIcon } from "lucide-react";
import { InputField, PrefixedInput } from "./userstable";
import { useSession } from "@/lib/auth";
import { UserItem } from "./header";
import { ConfirmDialog } from "./confirmDialog";
import { CopyValueRow } from "./domainstable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";

export function GroupsTable({groupsListHook}: {groupsListHook: any}) {
    const [groups, setGroups] = useState<any>([]);
    useEffect(() => {
        if (groupsListHook.loaded) {
            setGroups(groupsListHook.data?.map((group: any) => ({
                ...group,
                resourcesCount: (group.users?.length || 0) + (group.devices?.length || 0),
            })) || [])
        }
    }, [groupsListHook]);
    const table = useReactTable({
        data: groups,
        columns: [
            {
                header: "Group Name",
                accessorKey: "groupname",
            },
            {
                header: "Name",
                accessorKey: "name",
            },
            {
                header: "Description",
                accessorKey: "description",
            },
            {
                header: "Type",
                accessorKey: "type",
            },
            {
                header: "Resources",
                accessorKey: "resourcesCount",
            },
        ],
        getCoreRowModel: getCoreRowModel(),
    });
    if (!groupsListHook.loaded) {
        return <div>Loading...</div>;
    }
    return (
        <div className="overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm w-full">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.map((row) => (
                        <TableRowWithDrawer key={row.id} row={row} groupsListHook={groupsListHook} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

const TableRowWithDrawer = ({row, groupsListHook}: {row: Row<any>, groupsListHook: any}) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} onClick={() => setOpen(true)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                ))}
            </TableRow>
            <GroupInfoDrawer open={open} setOpen={setOpen} group={row.original} groupsListHook={groupsListHook} />
        </>
    );
}

function getConditionOptions(attribute: string, resources: { departments: any[]; locations: any[]; orgRoles: any[] }) {
    const departments = Array.isArray(resources.departments) ? resources.departments : [];
    const locations = Array.isArray(resources.locations) ? resources.locations : [];
    const orgRoles = Array.isArray(resources.orgRoles) ? resources.orgRoles : [];
    if (attribute === "Departments") {
        return departments.map((department) => department.name);
    }
    if (attribute === "OrgRole") {
        return orgRoles.map((orgRole) => orgRole.name);
    }
    if (attribute === "Location") {
        return locations.map((location) => location.name);
    }
    return [];
}

function GroupInfoDrawer({open, setOpen, group, groupsListHook}: {open: boolean, setOpen: (open: boolean) => void, group: any, groupsListHook: any}) {
    const [users, setUsers] = useState<any>(group.users);
    const [devices, setDevices] = useState<any>(group.devices);
    const [conditions, setConditions] = useState<any[]>(group.conditions || []);
    const [name, setName] = useState(group.name);
    const [description, setDescription] = useState(group.description);
    const [groupname, setGroupname] = useState(group.groupname);
    const [conditionTargetType, setConditionTargetType] = useState("User");
    const [conditionAttribute, setConditionAttribute] = useState("Email");
    const [conditionOperator, setConditionOperator] = useState("Equals");
    const [conditionValue, setConditionValue] = useState("");
    const [conditionSelectValues, setConditionSelectValues] = useState<string[]>([]);
    const [editingConditionId, setEditingConditionId] = useState<string | null>(null);
    const [loadingConditions, setLoadingConditions] = useState(false);
    const [conditionsError, setConditionsError] = useState("");
    const [recalculating, setRecalculating] = useState(false);
    const departmentsList = useDepartmentsList();
    const locationsList = useLocationsList();
    const orgRolesList = useOrgRolesList();
    const refreshGroupState = async () => {
        const [nextGroup, nextConditions] = await Promise.all([
            getGroupById({ groupId: group.id }) as Promise<any>,
            listMagicGroupConditions({ groupId: group.id }) as Promise<any[]>,
        ]);
        if (!(nextGroup as any)?.error) {
            setUsers((nextGroup as any)?.users || []);
            setDevices((nextGroup as any)?.devices || []);
        }
        if (!(nextConditions as any)?.error) {
            setConditions(nextConditions || []);
        }
    };
    useEffect(() => {
        setUsers(group.users);
        setDevices(group.devices);
        setConditions(group.conditions || []);
        setEditingConditionId(null);
        setConditionTargetType("User");
        setConditionAttribute("Email");
        setConditionOperator("Equals");
        setConditionValue("");
        setConditionSelectValues([]);
        setConditionsError("");
        setRecalculating(false);
    }, [open]);
    useEffect(() => {
        const trimmedName = groupname.trim().toLowerCase();
        const validName = trimmedName.replaceAll(/[^a-z0-9-_]/g, "");
        setGroupname(validName);
    }, [groupname]);
    useEffect(() => {
        if (!open || group.type !== "Magic") {
            return;
        }
        setLoadingConditions(true);
        listMagicGroupConditions({ groupId: group.id }).then((data: any) => {
            if (data?.error) {
                setConditionsError(data.error.text || "Failed to load conditions");
                setConditions([]);
            } else {
                setConditions(data || []);
                setConditionsError("");
            }
        }).finally(() => {
            setLoadingConditions(false);
        });
    }, [open, group.id, group.type]);
    const session = useSession();
    const conditionAttributeOptions = conditionTargetType === "Device"
        ? ["Departments", "Tags", "Location"]
        : conditionTargetType === "Both"
            ? ["Departments", "Tags", "Location"]
            : ["Email", "Departments", "Tags", "OrgRole", "Status", "Location"];
    useEffect(() => {
        if (!conditionAttributeOptions.includes(conditionAttribute)) {
            setConditionAttribute(conditionAttributeOptions[0]);
        }
    }, [conditionAttribute, conditionAttributeOptions, conditionTargetType, setConditionAttribute]);
    useEffect(() => {
        const nextValues = getConditionOptions(conditionAttribute, {
            departments: departmentsList.data || [],
            locations: locationsList.data || [],
            orgRoles: orgRolesList.data || [],
        });
        setConditionSelectValues(nextValues);
        if (conditionAttribute === "Status") {
            if (!["active", "disabled"].includes(conditionValue)) {
                setConditionValue("active");
            }
        } else if (nextValues.length > 0 && !nextValues.includes(conditionValue)) {
            setConditionValue(nextValues[0]);
        }
    }, [conditionAttribute, conditionValue, departmentsList.data, locationsList.data, orgRolesList.data, departmentsList.loaded, locationsList.loaded, orgRolesList.loaded, setConditionValue]);
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen} onClose={() => {
            if (users.length > group.users.length || users.length < group.users.length || devices.length > group.devices.length || devices.length < group.devices.length) {
                setTimeout(() => {
                    groupsListHook.reload();
                }, 1000);
            }
        }}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{group.name}</DrawerTitle>
                    <DrawerDescription>Manage this group</DrawerDescription>
                </DrawerHeader>
                <Separator />
                <div className="drawer-mainarea">
                    <div style={{fontSize: "20px", fontWeight: "500", marginLeft: "20px", marginTop: "20px"}}>Group Options</div>
                    <PrefixedInput prefix={session?.data?.user?.tenant.name + "/"} label="Group Name" value={groupname} setValue={setGroupname} />
                    <InputField label="Name" value={name} setValue={setName} />
                    <InputField label="Description" value={description} setValue={setDescription} />
                    <div className="p-[0px_20px_0px_20px] grid gap-2">
                        <div className="text-xs font-medium text-muted-foreground">Group Type</div>
                        <div className="rounded-md border bg-background px-3 py-2 text-sm">{group.type || "Organizational"}</div>
                    </div>
                    {group.type !== "Magic" ? (
                        <div className="mx-5 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                            Set the group type to Magic to manage auto-membership conditions.
                        </div>
                    ) : null}
                    <div className="p-[20px_20px_0px_20px] flex flex-row gap-2 items-center justify-end">
                        {group.type === "Magic" ? (
                            <Button variant="outline" disabled={recalculating} onClick={async () => {
                                setRecalculating(true);
                                try {
                                    await refreshGroupState();
                                    await recalculateMagicGroup({ groupId: group.id });
                                    await refreshGroupState();
                                } finally {
                                    setRecalculating(false);
                                }
                            }}>{recalculating ? "Recalculating..." : "Recalculate"}</Button>
                        ) : null}
                        <Button variant="outline" disabled={name === group.name && description === group.description && groupname === group.groupname} onClick={() => {
                            setGroupname(group.groupname);
                            setName(group.name);
                            setDescription(group.description);
                        }}><XIcon size={20} />Discard Changes</Button>
                        <Button disabled={name === group.name && description === group.description && groupname === group.groupname} onClick={() => {
                            updateGroup({groupId: group.id, name, description, groupname}).then(() => {
                                setOpen(false);
                                setTimeout(() => {
                                    groupsListHook.reload();
                                }, 1000);
                            });
                        }}><SaveIcon size={20} />Save</Button>
                    </div>
                    <Separator style={{marginTop: "25px"}} />
                    <div style={{fontSize: "20px", fontWeight: "500", marginLeft: "20px", marginTop: "20px"}}>Group Resources</div>
                    {group.type === "Magic" ? (
                        <div className="mx-5 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                            Users in magic groups are managed automatically from conditions.
                        </div>
                    ) : (
                        <UserSearchInput onUserSelect={(user) => {
                            if (user.type === "user") {
                                addUserToGroup({groupId: group.id, userId: user.user.id}).then((useritem) => {
                                    setUsers([...users, useritem]);
                                });
                            } else if (user.type === "device") {
                                addDeviceToGroup({groupId: group.id, deviceId: user.device.id}).then((deviceitem) => {
                                    setDevices([...devices, deviceitem]);
                                });
                            }
                        }} />
                    )}
                    {group.type === "Magic" && (
                        <MagicGroupConditionsPanel
                            groupId={group.id}
                            groupType={group.type}
                            conditions={conditions}
                            setConditions={setConditions}
                            loadingConditions={loadingConditions}
                            conditionsError={conditionsError}
                            conditionTargetType={conditionTargetType}
                            setConditionTargetType={setConditionTargetType}
                            conditionAttribute={conditionAttribute}
                            setConditionAttribute={setConditionAttribute}
                            conditionOperator={conditionOperator}
                            setConditionOperator={setConditionOperator}
                            conditionValue={conditionValue}
                            setConditionValue={setConditionValue}
                            conditionSelectValues={conditionSelectValues}
                            editingConditionId={editingConditionId}
                            setEditingConditionId={setEditingConditionId}
                            conditionAttributeOptions={conditionAttributeOptions}
                            refreshGroupState={refreshGroupState}
                        />
                    )}
                    <div style={{margin: "20px 20px 0px 20px"}}>
                        <div style={{fontSize: "14px", fontWeight: "500", marginBottom: "10px"}}>Resources with access</div>
                        <div className="p-3 flex flex-col gap-3 shadow-sm rounded-md bg-card">{users?.map((userAppAccessItem: any) => (
                            <UserGroupAccessRow key={userAppAccessItem.id} user={userAppAccessItem} users={users} setUsers={setUsers} canRemove={group.type !== "Magic"} />
                        ))}
                        {devices?.map((deviceAppAccessItem: any) => (
                            <DeviceGroupAccessRow key={deviceAppAccessItem.id} device={deviceAppAccessItem} devices={devices} setDevices={setDevices} />
                        ))}</div>
                    </div>
                </div>
                <Separator />
                <DrawerFooter style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end"}}>
                    <DrawerClose><Button><XIcon size={20} />Close</Button></DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

function MagicGroupConditionsPanel({
    groupId,
    groupType,
    conditions,
    setConditions,
    loadingConditions,
    conditionsError,
    conditionTargetType,
    setConditionTargetType,
    conditionAttribute,
    setConditionAttribute,
    conditionOperator,
    setConditionOperator,
    conditionValue,
    setConditionValue,
    conditionSelectValues,
    editingConditionId,
    setEditingConditionId,
    conditionAttributeOptions,
    refreshGroupState,
}: {
    groupId: string;
    groupType: string;
    conditions: any[];
    setConditions: (conditions: any[]) => void;
    loadingConditions: boolean;
    conditionsError: string;
    conditionTargetType: string;
    setConditionTargetType: (value: string) => void;
    conditionAttribute: string;
    setConditionAttribute: (value: string) => void;
    conditionOperator: string;
    setConditionOperator: (value: string) => void;
    conditionValue: string;
    setConditionValue: (value: string) => void;
    conditionSelectValues: string[];
    editingConditionId: string | null;
    setEditingConditionId: (value: string | null) => void;
    conditionAttributeOptions: string[];
    refreshGroupState: () => Promise<void>;
}) {
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const resetDraft = () => {
        setEditingConditionId(null);
        setConditionTargetType("User");
        setConditionAttribute("Email");
        setConditionOperator("Equals");
        setConditionValue("");
    };

    const submitCondition = async () => {
        setSaving(true);
        try {
            const normalizedValue = conditionValue.trim();
            const payload = {
                groupId,
                targetType: conditionTargetType,
                attribute: conditionAttribute,
                operator: conditionOperator,
                value: normalizedValue,
            };
            const result = editingConditionId
                ? await updateMagicGroupCondition({ conditionId: editingConditionId, ...payload })
                : await createMagicGroupCondition(payload);
            if (!(result as any)?.error) {
                await refreshGroupState();
                resetDraft();
            }
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (condition: any) => {
        setEditingConditionId(condition.id);
        setConditionTargetType(condition.targetType);
        setConditionAttribute(condition.attribute);
        setConditionOperator(condition.operator);
        setConditionValue(condition.value);
    };

    const removeCondition = async (conditionId: string) => {
        setDeletingId(conditionId);
        try {
            const result = await deleteMagicGroupCondition({ conditionId });
            if (!(result as any)?.error) {
                await refreshGroupState();
                if (editingConditionId === conditionId) {
                    resetDraft();
                }
            }
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div style={{margin: "20px 20px 0px 20px"}}>
            <div style={{fontSize: "14px", fontWeight: "500", marginBottom: "10px"}}>Magic Group Conditions</div>
            <div className="rounded-md border bg-card p-3 shadow-sm flex flex-col gap-3">
                {conditionsError ? <div className="text-sm text-destructive">{conditionsError}</div> : null}
                {loadingConditions ? <div className="text-sm text-muted-foreground">Loading conditions...</div> : null}
                <div className="grid gap-3">
                    <div className="grid gap-2 md:grid-cols-2">
                        <div className="grid gap-2">
                            <div className="text-xs font-medium text-muted-foreground">Target</div>
                            <Select value={conditionTargetType} onValueChange={setConditionTargetType}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Target" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="User">User</SelectItem>
                                    <SelectItem value="Device">Device</SelectItem>
                                    <SelectItem value="Both">Both</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <div className="text-xs font-medium text-muted-foreground">Attribute</div>
                            <Select value={conditionAttribute} onValueChange={setConditionAttribute}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Attribute" /></SelectTrigger>
                                <SelectContent>
                                    {conditionAttributeOptions.map((option) => (
                                        <SelectItem key={option} value={option}>{option}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                        <div className="grid gap-2">
                            <div className="text-xs font-medium text-muted-foreground">Operator</div>
                            <Select value={conditionOperator} onValueChange={setConditionOperator}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Operator" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Equals">Equals</SelectItem>
                                    <SelectItem value="NotEquals">Not equals</SelectItem>
                                    <SelectItem value="Contains">Contains</SelectItem>
                                    <SelectItem value="NotContains">Not contains</SelectItem>
                                    <SelectItem value="StartsWith">Starts with</SelectItem>
                                    <SelectItem value="EndsWith">Ends with</SelectItem>
                                    <SelectItem value="Includes">Includes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <div className="text-xs font-medium text-muted-foreground">Value</div>
                            {conditionAttribute === "Status" ? (
                                <Select value={conditionValue} onValueChange={setConditionValue}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="disabled">Disabled</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : conditionAttribute === "Departments" || conditionAttribute === "OrgRole" || conditionAttribute === "Location" ? (
                                <Select value={conditionValue} onValueChange={setConditionValue}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Select value" /></SelectTrigger>
                                    <SelectContent>
                                        {conditionSelectValues.map((option) => (
                                            <SelectItem key={option} value={option}>{option}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input value={conditionValue} onChange={(e) => setConditionValue(e.currentTarget.value)} placeholder="Condition value" />
                            )}
                        </div>
                    </div>
                    <div className="flex flex-row gap-2 justify-end">
                        {editingConditionId ? (
                            <Button variant="outline" onClick={resetDraft}><XIcon size={20} />Cancel Edit</Button>
                        ) : null}
                        <Button disabled={saving || !conditionValue.trim()} onClick={submitCondition}>
                            <CheckIcon size={20} />{editingConditionId ? "Save Condition" : "Add Condition"}
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    {conditions.length === 0 ? <div className="text-sm text-muted-foreground">No magic conditions yet.</div> : null}
                    {conditions.map((condition: any) => (
                        <div key={condition.id} className="rounded-md border bg-background p-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-col gap-1">
                                <div className="text-sm font-medium">{condition.targetType} {condition.attribute} {condition.operator}</div>
                                <div className="text-sm text-muted-foreground break-all">{condition.value}</div>
                            </div>
                            <div className="flex flex-row gap-2">
                                <Button variant="outline" onClick={() => startEdit(condition)}>Edit</Button>
                                <Button variant="outline" disabled={deletingId === condition.id} onClick={() => removeCondition(condition.id)}>
                                    <XIcon size={20} />Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function UserGroupAccessRow({user, users, setUsers, canRemove}: {user: any, users: any, setUsers: (users: any) => void, canRemove: boolean}) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    return (
        <UserItem user={user.user} Extra={
            <>
                {canRemove ? (
                    <>
                        <ConfirmDialog title="Remove User" description="Are you sure you want to remove this user from the group?" isOpen={confirmOpen} onConfirm={() => {
                            removeUserFromGroup({groupId: user.groupId, userId: user.user.id}).then(() => {
                                setUsers(users.filter((userAppAccessItem: any) => userAppAccessItem.id !== user.id));
                            });
                        }} onClose={() => {
                            setConfirmOpen(false);
                        }} />
                        <Button variant="outline" onClick={() => {
                            setConfirmOpen(true);
                        }}><XIcon size={20} /></Button>
                    </>
                ) : null}
            </>
        } />
    );
}

function DeviceGroupAccessRow({device, devices, setDevices}: {device: any, devices: any, setDevices: (devices: any) => void}) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    return (
        <UserItem user={{
            email: device.device.name,
            name: device.device.displayName,
        }} Icon={MonitorSmartphoneIcon} Extra={
            <>
                <ConfirmDialog title="Remove Device" description="Are you sure you want to remove this device from the group?" isOpen={confirmOpen} onConfirm={() => {
                    removeDeviceFromGroup({groupId: device.groupId, deviceId: device.device.id}).then(() => {
                        setDevices(devices.filter((deviceAppAccessItem: any) => deviceAppAccessItem.id !== device.id));
                    });
                }} onClose={() => {
                    setConfirmOpen(false);
                }} />
                <Button variant="outline" onClick={() => {
                    setConfirmOpen(true);
                }}><XIcon size={20} /></Button>
            </>
        } />
    );
}

export function CreateGroupDrawer({open, setOpen, groupsListHook}: {open: boolean, setOpen: (open: boolean) => void, groupsListHook: any}) {
    const [name, setName] = useState("");
    const [groupname, setGroupname] = useState("");
    const [groupType, setGroupType] = useState("Organizational");
    useEffect(() => {
        const trimmedName = groupname.trim().toLowerCase();
        const validName = trimmedName.replaceAll(/[^a-z0-9-_]/g, "");
        setGroupname(validName);
    }, [groupname]);
    const [description, setDescription] = useState("");
    const session = useSession();
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline"><PlusIcon size={20} />Create Group</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle style={{color: "var(--qu-text)", fontWeight: "500"}}>Create Group</DrawerTitle>
                </DrawerHeader>
                <Separator />
                <div className="drawer-mainarea">
                    <PrefixedInput prefix={session?.data?.user?.tenant.name + "/"} label="Name" value={groupname} setValue={setGroupname} />
                    <InputField label="Display Name" value={name} setValue={setName} />
                    <InputField label="Description" value={description} setValue={setDescription} />
                    <div className="p-[0px_20px_0px_20px] grid gap-2">
                        <div className="text-xs font-medium text-muted-foreground">Group Type</div>
                        <Select value={groupType} onValueChange={setGroupType}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Group Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Organizational">Organizational</SelectItem>
                                <SelectItem value="Functional">Functional</SelectItem>
                                <SelectItem value="Magic">Magic</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Separator />
                <DrawerFooter style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end"}}>
                    <Button variant="outline" onClick={() => setOpen(false)}><XIcon size={20} />Cancel</Button>
                    <Button onClick={async () => {
                        await CreateGroup({name, description, groupname, type: groupType});
                        setOpen(false);
                        setTimeout(() => {
                            groupsListHook.reload();
                        }, 1000);
                    }}><CheckIcon size={20} />Create</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

export function UserSearchInput({onUserSelect}: {onUserSelect: (user: any) => any}) {
    const session = useSession();
    const [value, setValue] = useState("");
    const [user, setUser] = useState<any>(null);
    const [device, setDevice] = useState<any>(null);
    return (
        <div style={{padding: "20px 20px 0px 20px"}}>
            <div style={{fontSize: "14px", fontWeight: "500", marginBottom: "10px"}}>Find Resource</div>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "10px"}}>
                <div className="flex items-center border border-input rounded-md shadow-xs bg-background focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow] px-3 h-9 text-base w-full">
                    <span style={{color: "var(--qu-text-secondary)"}} className="select-none text-[14px]">{session?.data?.user?.tenant.name + "/"}</span>
                    <input type="text" value={value} onChange={(e) => setValue(e.currentTarget.value)} onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            getUserByUsername(value).then((data: any) => {
                                if (data?.error) {
                                    console.log(data.error);
                                    setUser(null);
                                } else {
                                    setUser(data);
                                }
                            });
                            getDeviceByDeviceName(value).then((data: any) => {
                                if (data?.error) {
                                    console.log(data.error);
                                    setDevice(null);
                                } else {
                                    setDevice(data);
                                }
                            });
                        }
                    }} className="outline-none text-[14px] w-full" />
                </div>
                <Button variant="outline" onClick={() => {
                    getUserByUsername(value).then((data: any) => {
                        if (data?.error) {
                            console.log(data.error);
                            setUser(null);
                        } else {
                            setUser(data);
                        }
                    });
                    getDeviceByDeviceName(value).then((data: any) => {
                        if (data?.error) {
                            console.log(data.error);
                            setDevice(null);
                        } else {
                            setDevice(data);
                        }
                    });
                }}><SearchIcon size={20} />Search</Button>
            </div>
            {user?.id && <div className="border border-input rounded-md shadow-xs bg-background p-2 mt-[10px] hover:bg-input/50 cursor-pointer transition-all">
                <UserItem user={user} onClick={() => {
                    onUserSelect({type: "user", user});
                    setDevice(null);
                    setUser(null);
                    setValue("");
                }} />
            </div>}
            {device?.id && <div className="border border-input rounded-md shadow-xs bg-background p-2 mt-[10px] hover:bg-input/50 cursor-pointer transition-all">
                <UserItem user={{
                    email: device.name,
                    name: device.displayName,
                }} Icon={MonitorSmartphoneIcon} onClick={() => {
                    onUserSelect({type: "device", device});
                    setDevice(null);
                    setUser(null);
                    setValue("");
                }} />
            </div>}
        </div>
    );
}
