"use client"
import { AddUserToApp, CreateApp, createDomain, getUserByUsername, removeUserFromApp, updateApp, useAdminAppsList, useTenantsList, useUsersList, verifyDomain } from "@/lib/admin";
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

export function DomainsTable({domainsListHook}: {domainsListHook: any}) {
    const [domains, setDomains] = useState<any>([]);
    useEffect(() => {
        if (domainsListHook.loaded) {
            setDomains(domainsListHook.data?.map((domain: any) => ({
                ...domain,
                usersCount: domain.domainUsers?.length || 0,
            })) || [])
        }
    }, [domainsListHook]);
    const table = useReactTable({
        data: domains,
        columns: [
            {
                header: "Name",
                accessorKey: "name",
            },
            {
                header: "Verified",
                accessorKey: "verified",
            },
            {
                header: "Users",
                accessorKey: "usersCount",
            },
        ],
        getCoreRowModel: getCoreRowModel(),
    });
    if (!domainsListHook.loaded) {
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
                        <TableRowWithDrawer key={row.id} row={row} domainsListHook={domainsListHook} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

const TableRowWithDrawer = ({row, domainsListHook}: {row: Row<any>, domainsListHook: any}) => {
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
            <DomainInfoDrawer open={open} setOpen={setOpen} domain={row.original} domainsListHook={domainsListHook} />
        </>
    );
}

function DomainInfoDrawer({open, setOpen, domain, domainsListHook}: {open: boolean, setOpen: (open: boolean) => void, domain: any, domainsListHook: any}) {
    const [domainUsers, setDomainUsers] = useState<any>(domain.domainUsers);
    const [name, setName] = useState(domain.name);
    const [verified, setVerified] = useState(domain.verified);
    const session = useSession();
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{domain.name}</DrawerTitle>
                    <DrawerDescription>Manage this domain</DrawerDescription>
                </DrawerHeader>
                <Separator />
                <div className="drawer-mainarea">
                    {!domain.verified && <>
                        <div style={{fontSize: "20px", fontWeight: "500", marginLeft: "20px", marginTop: "20px"}}>Verify Domain</div>
                        <CopyValueRow value={"_quntem-challenge." + domain.name} title="Record Name" />
                        <CopyValueRow value={domain.id} title="Record Value" />
                        <Button style={{marginLeft: "20px", marginRight: "20px", marginTop: "20px", width: "calc(100% - 40px)"}} onClick={() => verifyDomain({domainId: domain.id}).then((value) => {
                            console.log(value);
                            if (value.error) {
                                toast("Error", {description: "Failed to verify domain"});
                            } else if (value.verified) {
                                toast("Verified", {description: "Domain verified successfully"});
                                setOpen(false);
                                setTimeout(() => {
                                    domainsListHook.reload();
                                }, 1000);
                            }
                        })} variant="outline"><CheckIcon size={20} />Verify</Button>
                    </>}
                </div>
                <Separator />
                <DrawerFooter style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end"}}>
                    <Button onClick={() => setOpen(false)}><XIcon size={20} />Close</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

function DomainUserRow({userAppAccess, setUserAppAccess, userAppAccessList, appId}: {userAppAccess: any, setUserAppAccess: (userAppAccess: any) => void, userAppAccessList: any, appId: string}) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    return (
        <UserItem user={userAppAccess.user} Extra={
            <>
                <ConfirmDialog title="Remove User" description="Are you sure you want to remove this user from the app?" isOpen={confirmOpen} onConfirm={() => {
                    removeUserFromApp({accessId: userAppAccess.id, appId}).then(() => {
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

export function AddDomainDrawer({open, setOpen, domainsListHook}: {open: boolean, setOpen: (open: boolean) => void, domainsListHook: any}) {
    const [domain, setDomain] = useState("");
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline"><PlusIcon size={20} />Add Domain</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle style={{color: "var(--qu-text)", fontWeight: "500"}}>Add Domain</DrawerTitle>
                </DrawerHeader>
                <Separator />
                <div className="drawer-mainarea">
                    <InputField type="url" label="Domain Name" value={domain} setValue={setDomain} />
                </div>
                <Separator />
                <DrawerFooter style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end"}}>
                    <Button variant="outline" onClick={() => setOpen(false)}><XIcon size={20} />Cancel</Button>
                    <Button onClick={async () => {
                        await createDomain({domain});
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

export function CopyValueRow({value, title}: {value: string, title: string}) {
    const [copied, setCopied] = useState(false);
    return (
        <div style={{padding: "20px 20px 0px 20px"}}>
            <div style={{fontSize: "14px", fontWeight: "500", marginBottom: "10px"}}>{title}</div>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "10px"}}>
                <Input value={value} readOnly style={{flex: 1, backgroundColor: "var(--header-background)", color: "var(--qu-text)"}} />
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