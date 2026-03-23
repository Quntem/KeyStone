"use client"
import { AddUserToApp, CreateApp, createDomain, getUserByUsername, removeUserFromApp, updateApp, updateDevice, useAdminAppsList, useTenantsList, useUsersList, verifyDomain } from "@/lib/admin";
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
import { CheckIcon, ClipboardCopyIcon, PlusIcon, SaveIcon, SearchIcon, XIcon } from "lucide-react";
import { InputField, PrefixedInput } from "./userstable";
import { useSession } from "@/lib/auth";
import { UserItem } from "./header";
import { ConfirmDialog } from "./confirmDialog";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { SelectInput } from "./rows";
import { useMDMServersList } from "@/lib/admin";

export function DevicesTable({ devicesListHook }: { devicesListHook: any }) {
    const [devices, setDevices] = useState<any>([]);
    const mdmsListHook = useMDMServersList();
    const usersListHook = useUsersList();
    useEffect(() => {
        if (devicesListHook.loaded) {
            setDevices(devicesListHook.data?.map((device: any) => ({
                ...device,
            })) || [])
        }
    }, [devicesListHook]);
    const table = useReactTable({
        data: devices,
        columns: [
            {
                header: "Display Name",
                accessorKey: "displayName",
                cell: ({ row }) => {
                    return row.original.displayName
                }
            },
            {
                header: "Name",
                accessorKey: "name",
                cell: ({ row }) => {
                    return row.original.tenant.name + "/" + row.original.name;
                }
            },
            {
                header: "Hardware Type",
                accessorKey: "hardwareType",
                cell: ({ row }) => {
                    return row.original.hardwareType[0].toUpperCase() + row.original.hardwareType.slice(1).toLowerCase();
                }
            },
            {
                header: "Software Type",
                accessorKey: "softwareType",
                cell: ({ row }) => {
                    return row.original.softwareType == "THETAOS" ? "ThetaOS" : "Other";
                }
            },
            {
                header: "OS",
                accessorKey: "os",
            },
            {
                header: "OS Version",
                accessorKey: "osVersion",
            },
            {
                header: "Assigned To",
                accessorKey: "user",
                cell: ({ row }) => {
                    return row.original.user?.username ? row.original.tenant.name + "/" + row.original.user?.username : "Not Assigned";
                },
            },
            {
                header: "MDM Server",
                accessorKey: "mdmServerId",
                cell: ({ row }) => {
                    return row.original.mdmServer?.name || "Not Assigned";
                },
            },
        ],
        getCoreRowModel: getCoreRowModel(),
    });
    if (!devicesListHook.loaded) {
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
                        <TableRowWithDrawer key={row.id} row={row} devicesListHook={devicesListHook} mdmsListHook={mdmsListHook} usersListHook={usersListHook} setDevices={setDevices} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

const TableRowWithDrawer = ({ row, devicesListHook, mdmsListHook, usersListHook, setDevices }: { row: Row<any>, devicesListHook: any, mdmsListHook: any, usersListHook: any, setDevices: (devices: any) => void }) => {
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
            <DeviceInfoDrawer open={open} setOpen={setOpen} device={row.original} devicesListHook={devicesListHook} mdmsListHook={mdmsListHook} usersListHook={usersListHook} setDevices={setDevices} />
        </>
    );
}

function DeviceInfoDrawer({ open, setOpen, device, devicesListHook, mdmsListHook, usersListHook, setDevices }: { open: boolean, setOpen: (open: boolean) => void, device: any, devicesListHook: any, mdmsListHook: any, usersListHook: any, setDevices: (devices: any) => void }) {
    const [name, setName] = useState(device.name);
    const [displayName, setDisplayName] = useState(device.displayName);
    const [assignedTo, setAssignedTo] = useState(device.assignedTo);
    const [mdmServerId, setMDMServerId] = useState(device.mdmServerId);
    const session = useSession();
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen}>
            <DrawerContent style={{ backgroundColor: "var(--qu-background)" }}>
                <DrawerHeader className="bg-white">
                    <DrawerTitle>{device.name}</DrawerTitle>
                    <DrawerDescription>Manage this device</DrawerDescription>
                </DrawerHeader>
                <Separator />
                <div className="drawer-mainarea">
                    <div style={{ fontSize: "20px", fontWeight: "500", marginLeft: "20px", marginTop: "20px" }}>Device Information</div>
                    <div style={{ fontSize: "14px", fontWeight: "500", marginLeft: "20px", marginTop: "0px", color: "var(--qu-text-secondary)" }}>Basic information about this device</div>
                    <InputField label="Name" value={device.name} disabled={true} />
                    <InputField label="Hardware Type" value={device.hardwareType} disabled={true} />
                    <InputField label="Software Type" value={device.softwareType} disabled={true} />
                    <InputField label="OS" value={device.os} disabled={true} />
                    <InputField label="OS Version" value={device.osVersion} disabled={true} />
                    <Separator style={{ marginTop: "25px" }} />
                    <div style={{ fontSize: "20px", fontWeight: "500", marginLeft: "20px", marginTop: "20px" }}>Device Settings</div>
                    <div style={{ fontSize: "14px", fontWeight: "500", marginLeft: "20px", marginTop: "0px", color: "var(--qu-text-secondary)" }}>Configure settings for this device</div>
                    <InputField label="Display Name" value={displayName} setValue={setDisplayName} />
                    <SelectInput label="Assigned To" value={assignedTo} setValue={(value: string) => {
                        setAssignedTo(value);
                    }} options={[{ id: null, name: "Unassigned", description: "Do not assign this device to any user" }, ...usersListHook.data?.users.map((user: any) => {
                        return {
                            id: user.id,
                            name: user.name,
                            description: user.tenant.name + "/" + user.username,
                        }
                    })]} />
                    <SelectInput label="MDM Server" value={mdmServerId} setValue={(value: string) => {
                        setMDMServerId(value);
                    }} options={[{ id: null, name: "Unassigned", description: "Do not assign this device to any MDM server" }, ...mdmsListHook.data?.map((mdm: any) => {
                        return {
                            id: mdm.id,
                            name: mdm.name,
                            description: mdm.id,
                        }
                    })]} />
                </div>
                <Separator />
                <DrawerFooter className="bg-white" style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                    <Button variant="outline" onClick={() => {
                        updateDevice({
                            id: device.id,
                            name,
                            hardwareType: device.hardwareType,
                            softwareType: device.softwareType,
                            os: device.os,
                            osVersion: device.osVersion,
                            assignedTo: assignedTo,
                            mdmServerId: mdmServerId,
                            extraInfo: device.extraInfo,
                            displayName,
                        }).then(() => {
                            setDisplayName("");
                            setOpen(false);
                            setTimeout(() => {
                                setDevices([]);
                                devicesListHook.reload();
                            }, 500);
                        });
                    }}><SaveIcon size={20} />Save</Button>
                    <Button onClick={() => setOpen(false)}><XIcon size={20} />Close</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

function DomainUserRow({ userAppAccess, setUserAppAccess, userAppAccessList, appId }: { userAppAccess: any, setUserAppAccess: (userAppAccess: any) => void, userAppAccessList: any, appId: string }) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    return (
        <UserItem user={userAppAccess.user} Extra={
            <>
                <ConfirmDialog title="Remove User" description="Are you sure you want to remove this user from the app?" isOpen={confirmOpen} onConfirm={() => {
                    removeUserFromApp({ accessId: userAppAccess.id, appId }).then(() => {
                        setUserAppAccess(userAppAccessList.filter((userAppAccessItem: any) => userAppAccessItem.id !== userAppAccess.id));
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

export function AddDomainDrawer({ open, setOpen, domainsListHook }: { open: boolean, setOpen: (open: boolean) => void, domainsListHook: any }) {
    const [domain, setDomain] = useState("");
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline"><PlusIcon size={20} />Add Domain</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle style={{ color: "var(--qu-text)", fontWeight: "500" }}>Add Domain</DrawerTitle>
                </DrawerHeader>
                <Separator />
                <div className="drawer-mainarea">
                    <InputField type="url" label="Domain Name" value={domain} setValue={setDomain} />
                </div>
                <Separator />
                <DrawerFooter style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                    <Button variant="outline" onClick={() => setOpen(false)}><XIcon size={20} />Cancel</Button>
                    <Button onClick={async () => {
                        await createDomain({ domain });
                        setOpen(false);
                        setTimeout(() => {
                            domainsListHook.reload();
                        }, 1000);
                    }}><CheckIcon size={20} />Add</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

export function CopyValueRow({ value, title }: { value: string, title: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <div style={{ padding: "20px 20px 0px 20px" }}>
            <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "10px" }}>{title}</div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                <Input value={value} readOnly style={{ flex: 1, backgroundColor: "var(--header-background)", color: "var(--qu-text)" }} />
                <Button variant="outline" onClick={() => {
                    navigator.clipboard.writeText(value);
                    setCopied(true);
                    setTimeout(() => {
                        setCopied(false);
                    }, 2000);
                }}>
                    {copied ? <><CheckIcon size={20} />Copied</> : <><ClipboardCopyIcon size={20} />Copy</>}
                </Button>
            </div>
        </div>
    );
}