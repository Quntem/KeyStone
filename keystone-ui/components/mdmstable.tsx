"use client"
import { AddUserToApp, CreateApp, createDomain, createMDMServer, getUserByUsername, removeUserFromApp, updateApp, useAdminAppsList, useTenantsList, useUsersList, verifyDomain } from "@/lib/admin";
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
import { SwitchInput } from "./rows";

export function MDMsTable({ mdmsListHook }: { mdmsListHook: any }) {
    const [mdms, setMDMs] = useState<any>([]);
    useEffect(() => {
        if (mdmsListHook.loaded) {
            setMDMs(mdmsListHook.data?.map((mdm: any) => ({
                ...mdm,
            })) || [])
        }
    }, [mdmsListHook]);
    const table = useReactTable({
        data: mdms,
        columns: [
            {
                header: "Name",
                accessorKey: "name",
            },
            {
                header: "Default",
                accessorKey: "isDefault",
            },
            {
                header: "Devices",
                accessorKey: "_count.devices",
                cell: ({ row }) => {
                    return row.original._count.devices;
                }
            },
        ],
        getCoreRowModel: getCoreRowModel(),
    });
    if (!mdmsListHook.loaded) {
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
                        <TableRowWithDrawer key={row.id} row={row} mdmsListHook={mdmsListHook} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

const TableRowWithDrawer = ({ row, mdmsListHook }: { row: Row<any>, mdmsListHook: any }) => {
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
            <MDMInfoDrawer open={open} setOpen={setOpen} mdm={row.original} mdmsListHook={mdmsListHook} />
        </>
    );
}

function MDMInfoDrawer({ open, setOpen, mdm, mdmsListHook }: { open: boolean, setOpen: (open: boolean) => void, mdm: any, mdmsListHook: any }) {
    const [domainUsers, setDomainUsers] = useState<any>(mdm.mdmUsers);
    const [name, setName] = useState(mdm.name);
    const [verified, setVerified] = useState(mdm.verified);
    const session = useSession();
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{mdm.name}</DrawerTitle>
                    <DrawerDescription>Manage this MDM Server</DrawerDescription>
                </DrawerHeader>
                <Separator />
                <div className="drawer-mainarea">
                    <CopyValueRow value={mdm.name} title="MDM Name" />
                    <CopyValueRow value={mdm.id} title="MDM ID" />
                </div>
                <Separator />
                <DrawerFooter style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
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

export function AddMDMDrawer({ open, setOpen, mdmsListHook }: { open: boolean, setOpen: (open: boolean) => void, mdmsListHook: any }) {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [enrollmentUrl, setEnrollmentUrl] = useState("");
    const [enrollmentToken, setEnrollmentToken] = useState("");
    const [isDefault, setIsDefault] = useState(false);
    const [unenrollmentUrl, setUnenrollmentUrl] = useState("");
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline"><PlusIcon size={20} />Add MDM Server</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle style={{ color: "var(--qu-text)", fontWeight: "500" }}>Add MDM Server</DrawerTitle>
                </DrawerHeader>
                <Separator />
                <div className="drawer-mainarea">
                    <InputField type="text" label="Name" value={name} setValue={setName} />
                    <InputField type="url" label="URL" value={url} setValue={setUrl} />
                    <InputField type="url" label="Enrollment URL" value={enrollmentUrl} setValue={setEnrollmentUrl} />
                    <InputField type="text" label="Enrollment Token" value={enrollmentToken} setValue={setEnrollmentToken} />
                    <InputField type="url" label="Unenrollment URL" value={unenrollmentUrl} setValue={setUnenrollmentUrl} />
                    <SwitchInput label="Is Default" value={isDefault} setValue={setIsDefault} />
                </div>
                <Separator />
                <DrawerFooter style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                    <Button variant="outline" onClick={() => setOpen(false)}><XIcon size={20} />Cancel</Button>
                    <Button onClick={async () => {
                        await createMDMServer({ name, url, enrollmentUrl, enrollmentToken, isDefault, unenrollmentUrl });
                        setOpen(false);
                        setTimeout(() => {
                            mdmsListHook.reload();
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