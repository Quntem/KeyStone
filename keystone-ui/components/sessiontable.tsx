"use client"
import { deleteSession, useSessionList } from "@/lib/auth";
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
import { ConfirmDialog } from "./confirmDialog";

export function SessionTable() {
    const sessionList = useSessionList();
    const [sessions, setSessions] = useState([]);
    useEffect(() => {
        if(sessionList.data?.error) {
            location.reload();
        }
        if (sessionList.loaded) {
            setSessions(sessionList.data?.map((session: any) => ({
                ...session,
                dateCreated: new Date(session.createdAt).toLocaleString(),
            })))
        }
    }, [sessionList]);
    const table = useReactTable({
        data: sessions,
        columns: [
            {
                header: "Date Created",
                accessorKey: "dateCreated",
            },
        ],
        getCoreRowModel: getCoreRowModel(),
    });
    if (!sessionList.loaded) {
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
                        <TableRowWithDrawer key={row.id} row={row} sessionsHook={sessionList}/>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

const TableRowWithDrawer = ({row, sessionsHook}: {row: Row<any>, sessionsHook: any}) => {
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
            <ConfirmDialog 
                isOpen={open}
                title="Confirm"
                description="Are you sure you want to end this session?"
                onConfirm={() => {
                    deleteSession(row.original.id).then(() => {
                        sessionsHook.reload();
                        setOpen(false);
                    });
                }}
                onClose={() => setOpen(false)}
            />
        </>
    );
}