"use client"
import { AddUserToApp, addUserToGroup, CreateApp, CreateGroup, getUserByUsername, removeUserFromApp, removeUserFromGroup, updateApp, updateGroup, useAdminAppsList, useTenantsList, useUsersList } from "@/lib/admin";
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
import { CheckIcon, PlusIcon, SaveIcon, SearchIcon, XIcon } from "lucide-react";
import { InputField, PrefixedInput } from "./userstable";
import { useSession } from "@/lib/auth";
import { UserItem } from "./header";
import { ConfirmDialog } from "./confirmDialog";
import { CopyValueRow } from "./domainstable";

export function GroupsTable({groupsListHook}: {groupsListHook: any}) {
    const [groups, setGroups] = useState<any>([]);
    useEffect(() => {
        if (groupsListHook.loaded) {
            setGroups(groupsListHook.data?.map((group: any) => ({
                ...group,
                usersCount: group.users?.length || 0,
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
                header: "Users",
                accessorKey: "usersCount",
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

function GroupInfoDrawer({open, setOpen, group, groupsListHook}: {open: boolean, setOpen: (open: boolean) => void, group: any, groupsListHook: any}) {
    const [users, setUsers] = useState<any>(group.users);
    const [name, setName] = useState(group.name);
    const [description, setDescription] = useState(group.description);
    const [groupname, setGroupname] = useState(group.groupname);
    useEffect(() => {
        setUsers(group.users);
    }, [open]);
    useEffect(() => {
        const trimmedName = groupname.trim().toLowerCase();
        const validName = trimmedName.replaceAll(/[^a-z0-9-_]/g, "");
        setGroupname(validName);
    }, [groupname]);
    const session = useSession();
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen} onClose={() => {
            if (users.length > group.users.length || users.length < group.users.length) {
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
                    <div className="p-[20px_20px_0px_20px] flex flex-row gap-2 items-center justify-end">
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
                    <div style={{fontSize: "20px", fontWeight: "500", marginLeft: "20px", marginTop: "20px"}}>Group Members</div>
                    <UserSearchInput onUserSelect={(user) => {
                        addUserToGroup({groupId: group.id, userId: user.id}).then((useritem) => {
                            setUsers([...users, useritem]);
                        });
                    }} />
                    <div style={{margin: "20px 20px 0px 20px"}}>
                        <div style={{fontSize: "14px", fontWeight: "500", marginBottom: "10px"}}>Users with access</div>
                        <div className="p-3 flex flex-col gap-3 shadow-sm rounded-md bg-card">{users?.map((userAppAccessItem: any) => (
                            <UserGroupAccessRow key={userAppAccessItem.id} user={userAppAccessItem} users={users} setUsers={setUsers} />
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

function UserGroupAccessRow({user, users, setUsers}: {user: any, users: any, setUsers: (users: any) => void}) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    return (
        <UserItem user={user.user} Extra={
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
        } />
    );
}

export function CreateGroupDrawer({open, setOpen, groupsListHook}: {open: boolean, setOpen: (open: boolean) => void, groupsListHook: any}) {
    const [name, setName] = useState("");
    const [groupname, setGroupname] = useState("");
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
                </div>
                <Separator />
                <DrawerFooter style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end"}}>
                    <Button variant="outline" onClick={() => setOpen(false)}><XIcon size={20} />Cancel</Button>
                    <Button onClick={async () => {
                        await CreateGroup({name, description, groupname});
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
    return (
        <div style={{padding: "20px 20px 0px 20px"}}>
            <div style={{fontSize: "14px", fontWeight: "500", marginBottom: "10px"}}>Find User</div>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "10px"}}>
                <div className="flex items-center border border-input rounded-md shadow-xs bg-background focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow] px-3 h-9 text-base w-full">
                    <span style={{color: "var(--qu-text-secondary)"}} className="select-none text-[14px]">{session?.data?.user?.tenant.name + "/"}</span>
                    <input type="text" value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            getUserByUsername(value).then((data) => {
                                if (data?.error) {
                                    console.log(data.error);
                                    setUser(null);
                                } else {
                                    setUser(data);
                                }
                            });
                        }
                    }} className="outline-none text-[14px] w-full" />
                </div>
                <Button variant="outline" onClick={() => {
                    getUserByUsername(value).then((data) => {
                        if (data?.error) {
                            console.log(data.error);
                            setUser(null);
                        } else {
                            setUser(data);
                        }
                    });
                }}><SearchIcon size={20} />Search</Button>
            </div>
            {user?.id && <div className="border border-input rounded-md shadow-xs bg-background p-2 mt-[10px] hover:bg-input/50 cursor-pointer transition-all">
                <UserItem user={user} onClick={() => {
                    onUserSelect(user);
                    setUser(null);
                    setValue("");
                }} />
            </div>}
        </div>
    );
}