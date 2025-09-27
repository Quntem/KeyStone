"use client"
import { useTenantsList, useUsersList } from "@/lib/admin";
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
import { XIcon } from "lucide-react";

export function TenantsTable() {
    const tenantsList = useTenantsList();
    const [tenants, setTenants] = useState([]);
    useEffect(() => {
        if (tenantsList.loaded) {
            setTenants(tenantsList.data)
        }
    }, [tenantsList]);
    const table = useReactTable({
        data: tenants,
        columns: [
            {
                header: "Name",
                accessorKey: "name",
            },
        ],
        getCoreRowModel: getCoreRowModel(),
    });
    if (!tenantsList.loaded) {
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
                        <TableRowWithDrawer key={row.id} row={row} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

const TableRowWithDrawer = ({row}: {row: Row<any>}) => {
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
            <TenantInfoDrawer open={open} setOpen={setOpen} tenant={row.original} />
        </>
    );
}

export function TenantInfoDrawer({open, setOpen, tenant}: {open: boolean, setOpen: (open: boolean) => void, tenant: any}) {
    return (
        <Drawer direction="right" open={open} onOpenChange={setOpen}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Manage Tenant</DrawerTitle>
                    <DrawerDescription>{tenant.name}</DrawerDescription>
                </DrawerHeader>
                <Separator />
                
                <DrawerFooter style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end"}}>
                    <Button onClick={() => setOpen(false)}><XIcon size={20} />Close</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}