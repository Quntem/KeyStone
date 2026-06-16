"use client"

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { PlusIcon, PencilIcon, SaveIcon, Trash2Icon, XIcon } from "lucide-react";
import { useLocationsList, createLocation, updateLocation, deleteLocation } from "@/lib/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { InputField } from "@/components/userstable";
import { ConfirmDialog } from "@/components/confirmDialog";
import { toast } from "sonner";

export default function LocationsPage() {
    const locationsList = useLocationsList();
    const [createOpen, setCreateOpen] = useState(false);
    const locations = locationsList.loaded ? ((locationsList.data as any) || []) : [];
    const table = useReactTable({
        data: locations,
        columns: [
            { header: "Name", accessorKey: "name" },
            { header: "Users", accessorFn: (row: any) => row._count?.users ?? 0, id: "users" },
            { header: "Devices", accessorFn: (row: any) => row._count?.devices ?? 0, id: "devices" },
            {
                header: "Actions",
                id: "actions",
                cell: ({ row }) => <LocationActions location={row.original} locationsList={locationsList} />,
            },
        ],
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <motion.div className="admin-page" initial={{ x: "50px" }} animate={{ x: "0px" }} transition={{ duration: 0.2, ease: "easeInOut" }}>
            <div className="admin-page-header">
                <div>
                    <div className="admin-page-title">Locations</div>
                    <div className="admin-page-subtitle">Manage locations in your tenant</div>
                </div>
                <Button variant={"outline"} onClick={() => setCreateOpen(true)}><PlusIcon size={20} />Add Location</Button>
            </div>
            {!locationsList.loaded ? (
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
            <LocationCreateDrawer open={createOpen} setOpen={setCreateOpen} locationsList={locationsList} />
        </motion.div>
    );
}

function LocationActions({ location, locationsList }: { location: any, locationsList: any }) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    return (
        <div className="flex items-center gap-2">
            <Button variant="link" size={'sm'} onClick={() => setEditOpen(true)}><PencilIcon size={18} />Edit</Button>
            <Button variant="link" size={'sm'} onClick={() => setDeleteOpen(true)}><Trash2Icon size={18} />Delete</Button>
            <LocationEditDrawer open={editOpen} setOpen={setEditOpen} location={location} locationsList={locationsList} />
            <ConfirmDialog
                title="Delete Location"
                description={`Are you sure you want to delete ${location.name}?`}
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={async () => {
                    const result: any = await deleteLocation({ id: location.id });
                    if (result?.error) {
                        toast.error("Failed to delete location");
                        return;
                    }
                    toast.success("Location deleted");
                    setDeleteOpen(false);
                    locationsList.reload();
                }}
            />
        </div>
    );
}

function LocationCreateDrawer({ open, setOpen, locationsList }: { open: boolean, setOpen: (open: boolean) => void, locationsList: any }) {
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
                    <DrawerTitle>Add Location</DrawerTitle>
                </DrawerHeader>
                <div className="drawer-mainarea">
                    <InputField label="Name" value={name} setValue={setName} />
                </div>
                <DrawerFooter style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                    <DrawerClose asChild>
                        <Button variant="outline"><XIcon size={20} />Cancel</Button>
                    </DrawerClose>
                    <Button onClick={async () => {
                        const result: any = await createLocation({ name });
                        if (result?.error) {
                            toast.error("Failed to create location");
                            return;
                        }
                        toast.success("Location created");
                        setOpen(false);
                        locationsList.reload();
                    }}><SaveIcon size={20} />Create</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

function LocationEditDrawer({ open, setOpen, location, locationsList }: { open: boolean, setOpen: (open: boolean) => void, location: any, locationsList: any }) {
    const [name, setName] = useState(location.name);
    useEffect(() => {
        if (open) {
            setName(location.name);
        }
    }, [location.name, open]);
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Edit Location</DrawerTitle>
                </DrawerHeader>
                <div className="drawer-mainarea">
                    <InputField label="Name" value={name} setValue={setName} />
                </div>
                <DrawerFooter style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                    <DrawerClose asChild>
                        <Button variant="outline"><XIcon size={20} />Cancel</Button>
                    </DrawerClose>
                    <Button onClick={async () => {
                        const result: any = await updateLocation({ id: location.id, name });
                        if (result?.error) {
                            toast.error("Failed to update location");
                            return;
                        }
                        toast.success("Location updated");
                        setOpen(false);
                        locationsList.reload();
                    }}><SaveIcon size={20} />Save</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
