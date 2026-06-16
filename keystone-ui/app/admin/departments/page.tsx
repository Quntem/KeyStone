"use client"

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { PlusIcon, PencilIcon, SaveIcon, Trash2Icon, XIcon } from "lucide-react";
import { useDepartmentsList, createDepartment, updateDepartment, deleteDepartment } from "@/lib/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { InputField } from "@/components/userstable";
import { ConfirmDialog } from "@/components/confirmDialog";
import { toast } from "sonner";

export default function DepartmentsPage() {
    const departmentsList = useDepartmentsList();
    const [createOpen, setCreateOpen] = useState(false);
    const departments = departmentsList.loaded ? ((departmentsList.data as any) || []) : [];
    const table = useReactTable({
        data: departments,
        columns: [
            { header: "Name", accessorKey: "name" },
            { header: "Users", accessorFn: (row: any) => row._count?.users ?? 0, id: "users" },
            {
                header: "Actions",
                id: "actions",
                cell: ({ row }) => <DepartmentActions department={row.original} departmentsList={departmentsList} />,
            },
        ],
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <motion.div className="admin-page" initial={{ x: "50px" }} animate={{ x: "0px" }} transition={{ duration: 0.2, ease: "easeInOut" }}>
            <div className="admin-page-header">
                <div>
                    <div className="admin-page-title">Departments</div>
                    <div className="admin-page-subtitle">Manage departments in your tenant</div>
                </div>
                <Button variant={"outline"} onClick={() => setCreateOpen(true)}><PlusIcon size={20} />Add Department</Button>
            </div>
            {!departmentsList.loaded ? (
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
            <DepartmentCreateDrawer open={createOpen} setOpen={setCreateOpen} departmentsList={departmentsList} />
        </motion.div>
    );
}

function DepartmentActions({ department, departmentsList }: { department: any, departmentsList: any }) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    return (
        <div className="flex items-center gap-2">
            <Button variant="link" size={'sm'} onClick={() => setEditOpen(true)}><PencilIcon size={18} />Edit</Button>
            <Button variant="link" size={'sm'} onClick={() => setDeleteOpen(true)}><Trash2Icon size={18} />Delete</Button>
            <DepartmentEditDrawer open={editOpen} setOpen={setEditOpen} department={department} departmentsList={departmentsList} />
            <ConfirmDialog
                title="Delete Department"
                description={`Are you sure you want to delete ${department.name}?`}
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={async () => {
                    const result: any = await deleteDepartment({ id: department.id });
                    if (result?.error) {
                        toast.error("Failed to delete department");
                        return;
                    }
                    toast.success("Department deleted");
                    setDeleteOpen(false);
                    departmentsList.reload();
                }}
            />
        </div>
    );
}

function DepartmentCreateDrawer({ open, setOpen, departmentsList }: { open: boolean, setOpen: (open: boolean) => void, departmentsList: any }) {
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
                    <DrawerTitle>Add Department</DrawerTitle>
                </DrawerHeader>
                <div className="drawer-mainarea">
                    <InputField label="Name" value={name} setValue={setName} />
                </div>
                <DrawerFooter style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                    <DrawerClose asChild>
                        <Button variant="outline"><XIcon size={20} />Cancel</Button>
                    </DrawerClose>
                    <Button onClick={async () => {
                        const result: any = await createDepartment({ name });
                        if (result?.error) {
                            toast.error("Failed to create department");
                            return;
                        }
                        toast.success("Department created");
                        setOpen(false);
                        departmentsList.reload();
                    }}><SaveIcon size={20} />Create</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

function DepartmentEditDrawer({ open, setOpen, department, departmentsList }: { open: boolean, setOpen: (open: boolean) => void, department: any, departmentsList: any }) {
    const [name, setName] = useState(department.name);
    useEffect(() => {
        if (open) {
            setName(department.name);
        }
    }, [department.name, open]);
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Edit Department</DrawerTitle>
                </DrawerHeader>
                <div className="drawer-mainarea">
                    <InputField label="Name" value={name} setValue={setName} />
                </div>
                <DrawerFooter style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                    <DrawerClose asChild>
                        <Button variant="outline"><XIcon size={20} />Cancel</Button>
                    </DrawerClose>
                    <Button onClick={async () => {
                        const result: any = await updateDepartment({ id: department.id, name });
                        if (result?.error) {
                            toast.error("Failed to update department");
                            return;
                        }
                        toast.success("Department updated");
                        setOpen(false);
                        departmentsList.reload();
                    }}><SaveIcon size={20} />Save</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
