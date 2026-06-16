"use client"

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { PlusIcon, PencilIcon, SaveIcon, Trash2Icon, XIcon } from "lucide-react";
import { useOrgRolesList, createOrgRole, updateOrgRole, deleteOrgRole } from "@/lib/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { InputField } from "@/components/userstable";
import { ConfirmDialog } from "@/components/confirmDialog";
import { toast } from "sonner";

export default function OrgRolesPage() {
    const orgRolesList = useOrgRolesList();
    const [createOpen, setCreateOpen] = useState(false);
    const orgRoles = orgRolesList.loaded ? ((orgRolesList.data as any) || []) : [];
    const table = useReactTable({
        data: orgRoles,
        columns: [
            { header: "Name", accessorKey: "name" },
            { header: "Users", accessorFn: (row: any) => row._count?.users ?? 0, id: "users" },
            {
                header: "Actions",
                id: "actions",
                cell: ({ row }) => <OrgRoleActions orgRole={row.original} orgRolesList={orgRolesList} />,
            },
        ],
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <motion.div className="admin-page" initial={{ x: "50px" }} animate={{ x: "0px" }} transition={{ duration: 0.2, ease: "easeInOut" }}>
            <div className="admin-page-header">
                <div>
                    <div className="admin-page-title">Org Roles</div>
                    <div className="admin-page-subtitle">Manage organization roles</div>
                </div>
                <Button variant={"outline"} onClick={() => setCreateOpen(true)}><PlusIcon size={20} />Add Org Role</Button>
            </div>
            {!orgRolesList.loaded ? (
                <div>Loading...</div>
            ) : (
                <div className="overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm w-full">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
            <OrgRoleCreateDrawer open={createOpen} setOpen={setCreateOpen} orgRolesList={orgRolesList} />
        </motion.div>
    );
}

function OrgRoleActions({ orgRole, orgRolesList }: { orgRole: any, orgRolesList: any }) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    return (
        <div className="flex items-center gap-2">
            <Button variant="link" size={'sm'} onClick={() => setEditOpen(true)}><PencilIcon size={18} />Edit</Button>
            <Button variant="link" size={'sm'} onClick={() => setDeleteOpen(true)}><Trash2Icon size={18} />Delete</Button>
            <OrgRoleEditDrawer open={editOpen} setOpen={setEditOpen} orgRole={orgRole} orgRolesList={orgRolesList} />
            <ConfirmDialog
                title="Delete Org Role"
                description={`Are you sure you want to delete ${orgRole.name}?`}
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={async () => {
                    const result: any = await deleteOrgRole({ id: orgRole.id });
                    if (result?.error) {
                        toast.error("Failed to delete org role");
                        return;
                    }
                    toast.success("Org role deleted");
                    setDeleteOpen(false);
                    orgRolesList.reload();
                }}
            />
        </div>
    );
}

function OrgRoleCreateDrawer({ open, setOpen, orgRolesList }: { open: boolean, setOpen: (open: boolean) => void, orgRolesList: any }) {
    const [name, setName] = useState("");
    useEffect(() => {
        if (open) {
            setName("");
        }
    }, [open]);
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Add Org Role</DrawerTitle>
                </DrawerHeader>
                <div className="drawer-mainarea">
                    <InputField label="Name" value={name} setValue={setName} />
                </div>
                <DrawerFooter style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                    <DrawerClose asChild>
                        <Button variant="outline"><XIcon size={20} />Cancel</Button>
                    </DrawerClose>
                    <Button onClick={async () => {
                        const result: any = await createOrgRole({ name });
                        if (result?.error) {
                            toast.error("Failed to create org role");
                            return;
                        }
                        toast.success("Org role created");
                        setOpen(false);
                        orgRolesList.reload();
                    }}><SaveIcon size={20} />Create</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

function OrgRoleEditDrawer({ open, setOpen, orgRole, orgRolesList }: { open: boolean, setOpen: (open: boolean) => void, orgRole: any, orgRolesList: any }) {
    const [name, setName] = useState(orgRole.name);
    useEffect(() => {
        if (open) {
            setName(orgRole.name);
        }
    }, [orgRole.name, open]);
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Edit Org Role</DrawerTitle>
                </DrawerHeader>
                <div className="drawer-mainarea">
                    <InputField label="Name" value={name} setValue={setName} />
                </div>
                <DrawerFooter style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                    <DrawerClose asChild>
                        <Button variant="outline"><XIcon size={20} />Cancel</Button>
                    </DrawerClose>
                    <Button onClick={async () => {
                        const result: any = await updateOrgRole({ id: orgRole.id, name });
                        if (result?.error) {
                            toast.error("Failed to update org role");
                            return;
                        }
                        toast.success("Org role updated");
                        setOpen(false);
                        orgRolesList.reload();
                    }}><SaveIcon size={20} />Save</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
