"use client"
import { createUser, setUserDisabled, setUserPassword, updateUser, useDepartmentsList, useDomainsList, useLocationsList, useOrgRolesList, useUsersList } from "@/lib/admin";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender, Row, ColumnFiltersState } from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { HTMLInputTypeAttribute, useEffect, useState } from "react";
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
import { CheckIcon, KeyIcon, Loader2Icon, PlusIcon, SaveIcon, TrashIcon, XIcon, XOctagonIcon } from "lucide-react";
import { Input } from "./ui/input";
import { ConfirmDialog, InputDialog } from "./confirmDialog";
import { useSession } from "@/lib/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import isEmail from "is-email";
import { useWindowSize } from "@/lib/screensize";
import { Switch } from "@/components/ui/switch";
import { usePathname } from "next/navigation";

export function UsersTable({ usersListHook }: { usersListHook: any }) {
    const [users, setUsers] = useState([]);
    const pathname = usePathname();
    useEffect(() => {
        if (usersListHook.loaded) {
            setUsers(usersListHook.data?.users.map((user: any) => ({
                ...user,
                name: user.name,
                usernameFull: user.tenant?.name + "/" + user.username,
                tenantName: user.tenant?.name,
                managerName: user.manager?.username ? user.manager?.tenant?.name + "/" + user.manager?.username : "",
                disabledPretty: user.disabled ? "Disabled" : "Enabled",
            })));
        }
    }, [usersListHook]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    )
    const table = useReactTable({
        data: users,
        columns: pathname.startsWith("/admin") ? [
            {
                id: "name",
                header: "Name",
                accessorKey: "name",
            },
            {
                id: "username",
                header: "Username",
                accessorKey: "usernameFull",
            },
            {
                id: "role",
                header: "Type",
                accessorKey: "role",
            },
            {
                id: "email",
                header: "Email",
                accessorKey: "email",
            },
            {
                id: "status",
                header: "Status",
                accessorKey: "disabledPretty",
            },
        ] : [
            {
                id: "name",
                header: "Name",
                accessorKey: "name",
            },
            {
                id: "username",
                header: "Username",
                accessorKey: "usernameFull",
            },
            {
                id: "email",
                header: "Email",
                accessorKey: "email",
            },
            {
                id: "status",
                header: "Status",
                accessorKey: "disabledPretty",
            },
        ],
        getCoreRowModel: getCoreRowModel(),
        state: {
            columnFilters,
        },
        onColumnFiltersChange: setColumnFilters,
    });
    if (!usersListHook.loaded || !usersListHook.data?.users) {
        return <div>Loading...</div>;
    }
    return (
        <>
            {/* <div className="flex flex-row gap-2 w-full">
                <Input placeholder="Search Username" style={{width: "fit-content", backgroundColor: "var(--header-background)", color: "var(--qu-text)"}} value={(table.getColumn("username")?.getFilterValue() as string) || ""} onChange={(e) => table.getColumn("username")?.setFilterValue(e.target.value)} />
            </div> */}
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
                            <TableRowWithDrawer key={row.id} row={row} usersListHook={usersListHook} />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

const TableRowWithDrawer = ({ row, usersListHook }: { row: Row<any>, usersListHook: any }) => {
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
            <UserInfoDrawer open={open} setOpen={setOpen} user={row.original} usersListHook={usersListHook} />
        </>
    );
}

export function UserInfoDrawer({ open, setOpen, user, usersListHook }: { open: boolean, setOpen: (open: boolean) => void, user: any, usersListHook: any }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");
    const departmentsList = useDepartmentsList();
    const locationsList = useLocationsList();
    const orgRolesList = useOrgRolesList();
    const [name, setName] = useState(user.name);
    const [username, setUsername] = useState(user.username);
    const [email, setEmail] = useState(user.email);
    const [role, setRole] = useState(user.role);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [domainId, setDomainId] = useState(user.domainId || "");
    const [locationId, setLocationId] = useState(user.location?.id || "");
    const [departmentIds, setDepartmentIds] = useState<string[]>((user.departments || []).map((department: any) => department.departmentId || department.department?.id).filter(Boolean));
    const [orgRoleIds, setOrgRoleIds] = useState<string[]>((user.orgRoles || []).map((orgRole: any) => orgRole.orgRoleId || orgRole.orgRole?.id).filter(Boolean));
    const [tagsText, setTagsText] = useState(stringifyTagsInput(user.tags));

    useEffect(() => {
        if (open) {
            setName(user.name);
            setUsername(user.username);
            setEmail(user.email);
            setRole(user.role);
            setDomainId(user.domainId || "");
            setLocationId(user.location?.id || "");
            setDepartmentIds((user.departments || []).map((department: any) => department.departmentId || department.department?.id).filter(Boolean));
            setOrgRoleIds((user.orgRoles || []).map((orgRole: any) => orgRole.orgRoleId || orgRole.orgRole?.id).filter(Boolean));
            setTagsText(stringifyTagsInput(user.tags));
        }
    }, [open, user]);

    const parsedTags = parseTagsInput(tagsText);
    const currentDepartmentIds = (user.departments || []).map((department: any) => department.departmentId || department.department?.id).filter(Boolean);
    const currentOrgRoleIds = (user.orgRoles || []).map((orgRole: any) => orgRole.orgRoleId || orgRole.orgRole?.id).filter(Boolean);
    const currentTags = user.tags || [];
    const hasChanges = name !== user.name
        || username !== user.username
        || email !== user.email
        || role !== user.role
        || domainId !== (user.domainId || "")
        || locationId !== (user.location?.id || "")
        || !sameStringArrays(departmentIds, currentDepartmentIds)
        || !sameStringArrays(orgRoleIds, currentOrgRoleIds)
        || !sameStringArrays(parsedTags, currentTags);

    return (
        <>
            <Drawer handleOnly direction="right" open={open} onClose={() => {
                if (hasChanges) {
                    setOpenConfirm(true);
                } else {
                    setOpen(false);
                }
            }}>
                <DrawerContent>
                    <DrawerHeader style={{ gap: "0px" }}>
                        <DrawerTitle style={{ color: "var(--qu-text)", fontWeight: "500" }}>{user.name}</DrawerTitle>
                        <DrawerDescription style={{ color: "var(--qu-text-secondary)" }}>{user.usernameFull}</DrawerDescription>
                    </DrawerHeader>
                    <Separator />
                    <div style={{ height: "100%", overflowY: "auto", color: "var(--qu-text)", backgroundColor: "var(--qu-background)" }}>
                        <UserQuickActions user={user} usersListHook={usersListHook} setOpen={setOpen} />
                        <InputField label="Name" value={name} setValue={setName} />
                        <PrefixedInput label="Username" value={username} setValue={setUsername} prefix={user.tenant?.name + "/"} />
                        {isAdmin ? <EmailOwnedDomainInput label="Email" value={email} setValue={setEmail} domainId={domainId} setDomainId={setDomainId} /> : null}
                        {isAdmin ? <SelectInput label="Role" value={role} setValue={setRole} options={[
                            { id: "ADMIN", name: "Admin", description: "Has full access to everything in the tenant" },
                            { id: "USER", name: "User", description: "Has limited access to the tenant" },
                            { id: "SERVICE", name: "Service", description: "An application or service that can perform actions automatically" }
                        ]} /> : null}
                        {isAdmin ? <NullableSelectInput label="Location" value={locationId} setValue={setLocationId} options={(locationsList.loaded ? locationsList.data : [])?.map((location: any) => ({ id: location.id, name: location.name })) || []} noneLabel="No location" placeholder="Select a location" /> : null}
                        {isAdmin ? <MultiSelectInput label="Departments" value={departmentIds} setValue={setDepartmentIds} options={(departmentsList.loaded ? departmentsList.data : [])?.map((department: any) => ({ id: department.id, name: department.name })) || []} emptyLabel="No departments available" /> : null}
                        {isAdmin ? <MultiSelectInput label="Org Roles" value={orgRoleIds} setValue={setOrgRoleIds} options={(orgRolesList.loaded ? orgRolesList.data : [])?.map((orgRole: any) => ({ id: orgRole.id, name: orgRole.name })) || []} emptyLabel="No org roles available" /> : null}
                        {isAdmin ? <InputField label="Tags" value={tagsText} setValue={setTagsText} extraInfo="Comma separated tags" /> : null}
                    </div>
                    <Separator />
                    <DrawerFooter style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                        <Button
                            disabled={!hasChanges}
                            variant="outline"
                            onClick={() => {
                                updateUser({
                                    userId: user.id,
                                    name,
                                    username,
                                    email,
                                    role,
                                    domainId,
                                    locationId: isAdmin ? (locationId || null) : undefined,
                                    departmentIds: isAdmin ? departmentIds : undefined,
                                    orgRoleIds: isAdmin ? orgRoleIds : undefined,
                                    tags: isAdmin ? parsedTags : undefined,
                                }).then(() => {
                                    setOpen(false);
                                    setTimeout(() => {
                                        usersListHook.reload();
                                    }, 1000);
                                });
                            }}
                        ><SaveIcon size={20} />Save</Button>
                        <Button onClick={() => {
                            if (hasChanges) {
                                setOpenConfirm(true);
                            } else {
                                setOpen(false);
                            }
                        }}><XIcon size={20} />Close</Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
            <ConfirmDialog
                title="Confirm"
                description="Are you sure you want to cancel? Any changes you have made will not be saved."
                isOpen={openConfirm}
                onConfirm={() => {
                    setOpen(false);
                    setOpenConfirm(false);
                    setName(user.name);
                    setUsername(user.username);
                    setEmail(user.email);
                    setRole(user.role);
                    setDomainId(user.domainId || "");
                    setLocationId(user.location?.id || "");
                    setDepartmentIds((user.departments || []).map((department: any) => department.departmentId || department.department?.id).filter(Boolean));
                    setOrgRoleIds((user.orgRoles || []).map((orgRole: any) => orgRole.orgRoleId || orgRole.orgRole?.id).filter(Boolean));
                    setTagsText(stringifyTagsInput(user.tags));
                }}
                onClose={() => setOpenConfirm(false)}
            />
        </>
    );
}

export function InputField({ label, value, setValue, type, style, autoComplete, extraInfo, disabled }: { label: string, value: string, setValue?: (value: string) => void, type?: HTMLInputTypeAttribute, style?: React.CSSProperties, autoComplete?: HTMLInputTypeAttribute, extraInfo?: React.ReactNode, disabled?: boolean }) {
    return (
        <div style={{ padding: "20px 20px 0px 20px", ...style }}>
            <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "10px" }}>{label}</div>
            <Input autoCorrect="off" autoCapitalize="off" style={{ backgroundColor: "var(--header-background)" }} value={value} onChange={(e) => setValue?.(e.target.value)} type={type} autoComplete={autoComplete} disabled={disabled} />
            {extraInfo && <div style={{ color: "var(--qu-text-secondary)", fontSize: "12px", marginTop: "5px" }}>{extraInfo}</div>}
        </div>
    );
}

export function EmailOwnedDomainInput({ label, value, setValue, type, style, autoComplete, domainId, setDomainId }: { label: string, value: string, setValue: (value: string) => void, type?: HTMLInputTypeAttribute, style?: React.CSSProperties, autoComplete?: HTMLInputTypeAttribute, domainId?: string, setDomainId?: (domainId: string) => void }) {
    const domains = useDomainsList();
    const [emailLocal, setEmailLocal] = useState(value.split("@")[0]);
    useEffect(() => {
        const domainList = (Array.isArray(domains.data) ? domains.data : []) as any[];
        const domain = domainList.find((domain: any) => domain.id === domainId);
        setValue(emailLocal + (domain?.name ? "@" + domain.name : ""));
    }, [emailLocal, domainId, domains.data, setValue]);
    return (
        <div style={{ padding: "20px 20px 0px 20px", ...style }}>
            <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "10px" }}>{label}</div>
                    <div className="flex flex-row gap-2">
                        <Input autoCorrect="off" autoCapitalize="off" style={{ backgroundColor: "var(--header-background)" }} value={emailLocal} onChange={(e) => setEmailLocal(e.target.value)} type={type} autoComplete={autoComplete} />
                <Select value={domainId || ""} onValueChange={(value) => setDomainId?.(value)}>
                    <SelectTrigger style={{ backgroundColor: "var(--header-background)" }}>
                        <SelectValue placeholder="Select a domain" />
                    </SelectTrigger>
                    <SelectContent>
                        {(Array.isArray(domains.data) ? domains.data : []).map((domain: any) => (
                            <SelectItem disabled={!domain.verified} key={domain.id} value={domain.id}>@{domain.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

function UserQuickActions({ user, usersListHook, setOpen }: { user: any, usersListHook: any, setOpen: (open: boolean) => void }) {
    const size = useWindowSize();
    const [confirmDisable, setConfirmDisable] = useState(false);
    const [openPassword, setOpenPassword] = useState(false);
    const [password, setPassword] = useState("");
    return (
        <div style={{ padding: "20px 20px 0px 20px" }}>
            <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "10px" }}>Quick Actions</div>
            {!user.disabled && <div className={size.width < 500 ? "flex items-center flex-col gap-2 w-full" : "flex items-center flex-row gap-2 w-full"}>
                <Button variant="outline" style={{ flex: "1", width: size.width < 500 ? "100%" : "auto" }} onClick={() => setOpenPassword(true)}><KeyIcon size={20} /> Password</Button>
                <Button variant="outline" style={{ flex: "1", width: size.width < 500 ? "100%" : "auto" }} onClick={() => setConfirmDisable(true)}><XOctagonIcon size={20} /> Disable</Button>
                {/* <Button variant="outline" style={{flex: "1", width: size.width < 500 ? "100%" : "auto"}}><TrashIcon size={20} /> Delete</Button> */}
            </div>}
            {user.disabled && <div className="flex items-center flex-row gap-2 w-full">
                <Button variant="outline" style={{ flex: "1" }} onClick={() => setConfirmDisable(true)}><CheckIcon size={20} /> Enable</Button>
            </div>}
            <ConfirmDialog
                title="Confirm"
                description={user.disabled ? "Are you sure you want to enable this user?" : "Are you sure you want to disable this user? you can enable them again later."}
                isOpen={confirmDisable}
                onConfirm={() => {
                    setUserDisabled(user.id, !user.disabled).then(() => {
                        setConfirmDisable(false);
                        setOpen(false);
                        setTimeout(() => {
                            usersListHook.reload();
                        }, 1000);
                    });
                }}
                onClose={() => setConfirmDisable(false)}
            />
            <InputDialog
                title="Set Password"
                description="Set a new password for this user"
                isOpen={openPassword}
                onConfirm={() => {
                    setUserPassword({ userId: user.id, password: password }).then(() => {
                        setOpen(false);
                        setOpenPassword(false);
                        setPassword("");
                        setTimeout(() => {
                            usersListHook.reload();
                        }, 1000);
                    });
                }}
                onClose={() => setOpenPassword(false)}
                input={password}
                setInput={setPassword}
                inputType="password"
            />
        </div>
    );
}

export function PrefixedInput({ label, value, setValue, prefix, style }: { label: string, value: string, setValue: (value: string) => void, prefix: string, style?: React.CSSProperties }) {
    return (
        <div style={{ padding: "20px 20px 0px 20px", ...style }}>
            <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "10px" }}>{label}</div>
            <div className="flex items-center border border-input rounded-md shadow-xs bg-background focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow] px-3 h-9 text-base">
                <span style={{ color: "var(--qu-text-secondary)" }} className="select-none text-[14px]">{prefix}</span>
                <input autoCorrect="off" autoCapitalize="off" type="text" value={value} onChange={(e) => setValue(e.target.value)} className="outline-none text-[14px] w-full" />
            </div>
        </div>
    );
}

export function SelectInput({ label, value, setValue, options }: { label: string, value: string, setValue: (value: string) => void, options: { id: string, name: string, description?: string }[] }) {
    return (
        <div style={{ padding: "20px 20px 0px 20px" }}>
            <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "10px" }}>{label}</div>
            <Select value={value} onValueChange={setValue}>
                <SelectTrigger style={{ backgroundColor: "var(--header-background)", width: "100%", height: "fit-content" }}>
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
                                <div style={{ color: "var(--qu-text)" }}>{option.name}</div>
                                {option.description && <div style={{ color: "var(--qu-text-secondary)" }}>{option.description}</div>}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

export function NullableSelectInput({ label, value, setValue, options, placeholder, noneLabel }: { label: string, value: string, setValue: (value: string) => void, options: { id: string, name: string, description?: string }[], placeholder?: string, noneLabel?: string }) {
    return (
        <div style={{ padding: "20px 20px 0px 20px" }}>
            <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "10px" }}>{label}</div>
            <Select value={value || "__none__"} onValueChange={(nextValue) => setValue(nextValue === "__none__" ? "" : nextValue)}>
                <SelectTrigger style={{ backgroundColor: "var(--header-background)", width: "100%", height: "fit-content" }}>
                    <SelectValue placeholder={placeholder || "Select an option"} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="__none__">{noneLabel || "None"}</SelectItem>
                    {options.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
                                <div style={{ color: "var(--qu-text)" }}>{option.name}</div>
                                {option.description && <div style={{ color: "var(--qu-text-secondary)" }}>{option.description}</div>}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

export function MultiSelectInput({
    label,
    value,
    setValue,
    options,
    emptyLabel,
}: {
    label: string;
    value: string[];
    setValue: (value: string[]) => void;
    options: { id: string, name: string, description?: string }[];
    emptyLabel?: string;
}) {
    const selectedOptions = options.filter((option) => value.includes(option.id));
    const triggerLabel = selectedOptions.length === 0
        ? emptyLabel || "Select options"
        : selectedOptions.map((option) => option.name).join(", ");
    return (
        <div style={{ padding: "20px 20px 0px 20px" }}>
            <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "10px" }}>{label}</div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between"
                    >
                        <span className="truncate text-left">{triggerLabel}</span>
                        <span className="text-xs text-muted-foreground">{value.length} selected</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[16rem]">
                    {options.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">{emptyLabel || "No options available"}</div>
                    ) : options.map((option) => (
                        <DropdownMenuCheckboxItem
                            key={option.id}
                            checked={value.includes(option.id)}
                            onSelect={(event) => event.preventDefault()}
                            onCheckedChange={(checked) => {
                                setValue(checked ? [...value, option.id] : value.filter((item) => item !== option.id));
                            }}
                        >
                            <div className="flex flex-col items-start">
                                <span>{option.name}</span>
                                {option.description && <span className="text-xs text-muted-foreground">{option.description}</span>}
                            </div>
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function parseTagsInput(tagsText: string) {
    return tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
}

function stringifyTagsInput(tags: string[] | undefined) {
    return (tags || []).join(", ");
}

function sameStringArrays(left: string[], right: string[]) {
    if (left.length !== right.length) {
        return false;
    }
    return [...left].sort().join("|") === [...right].sort().join("|");
}

export function SwitchInput({ label, value, setValue }: { label: string, value: boolean, setValue: (value: boolean) => void }) {
    return (
        <div style={{ padding: "20px 20px 0px 20px" }} className="flex items-center justify-between">
            <div style={{ fontSize: "14px", fontWeight: "500" }}>{label}</div>
            <Switch checked={value} onCheckedChange={setValue} />
        </div>
    );
}

export function SuffixedInput({ label, value, setValue, suffix, fitInput, pattern, style }: { label: string, value: string, setValue: (value: string) => void, suffix: string, fitInput?: boolean, pattern?: string, style?: React.CSSProperties }) {
    return (
        <div style={{ padding: "20px 20px 0px 20px", ...style }}>
            <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "10px" }}>{label}</div>
            <div className="flex items-center border border-input rounded-md shadow-xs bg-background focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow] px-3 h-9 text-base">
                <input autoCorrect="off" autoCapitalize="off" pattern={pattern} type="text" value={value} onChange={(e) => setValue(e.target.value)} className={"outline-none text-[14px]" + (fitInput ? "" : " w-full")} />
                <span style={{ color: "var(--qu-text-secondary)" }} className="select-none text-[14px]">{suffix}</span>
            </div>
        </div>
    );
}

export function AddUserDrawer({ open, setOpen, usersListHook }: { open: boolean, setOpen: (open: boolean) => void, usersListHook: any }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");
    const departmentsList = useDepartmentsList();
    const locationsList = useLocationsList();
    const orgRolesList = useOrgRolesList();
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState(isAdmin ? "" : "ADMIN");
    const session = useSession();
    const [password, setPassword] = useState("");
    const [domainId, setDomainId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [departmentIds, setDepartmentIds] = useState<string[]>([]);
    const [orgRoleIds, setOrgRoleIds] = useState<string[]>([]);
    const [tagsText, setTagsText] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline">
                    <PlusIcon size={20} />
                    Add User
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle style={{ color: "var(--qu-text)", fontWeight: "500" }}>Add User</DrawerTitle>
                </DrawerHeader>
                <Separator />
                {status === "idle" && <div className="drawer-mainarea">
                    <InputField label="Name" value={name} setValue={setName} />
                    <PrefixedInput label="Username" value={username} setValue={setUsername} prefix={session.data?.user?.tenant?.name + "/"} />
                    {/* <InputField label="Email" value={email} setValue={setEmail} /> */}
                    {isAdmin ? <EmailOwnedDomainInput label="Email" value={email} setValue={setEmail} domainId={domainId} setDomainId={setDomainId} /> : <InputField label="Email" value={email} setValue={setEmail} />}
                    <InputField label="Password" value={password} setValue={setPassword} type="password" />
                    {isAdmin ? <SelectInput label="Role" value={role} setValue={setRole} options={[
                        { id: "ADMIN", name: "Admin", description: "Has full access to everything in the tenant" },
                        { id: "USER", name: "User", description: "Has limited access to the tenant" },
                        { id: "SERVICE", name: "Service", description: "An application or service that can perform actions automatically" }
                    ]} /> : null}
                    {isAdmin ? <NullableSelectInput label="Location" value={locationId} setValue={setLocationId} options={(locationsList.loaded ? locationsList.data : [])?.map((location: any) => ({ id: location.id, name: location.name })) || []} noneLabel="No location" placeholder="Select a location" /> : null}
                    {isAdmin ? <MultiSelectInput label="Departments" value={departmentIds} setValue={setDepartmentIds} options={(departmentsList.loaded ? departmentsList.data : [])?.map((department: any) => ({ id: department.id, name: department.name })) || []} emptyLabel="No departments available" /> : null}
                    {isAdmin ? <MultiSelectInput label="Org Roles" value={orgRoleIds} setValue={setOrgRoleIds} options={(orgRolesList.loaded ? orgRolesList.data : [])?.map((orgRole: any) => ({ id: orgRole.id, name: orgRole.name })) || []} emptyLabel="No org roles available" /> : null}
                    {isAdmin ? <InputField label="Tags" value={tagsText} setValue={setTagsText} extraInfo="Comma separated tags" /> : null}
                </div>}
                {status === "loading" && <div className="drawer-mainarea">
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
                        <Loader2Icon className="animate-spin" size={20} />
                    </div>
                </div>}
                {status === "success" && <div className="drawer-mainarea">
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", width: "100%", gap: "15px" }}>
                        <CheckIcon size={30} />
                        <div style={{ color: "var(--qu-text)", fontSize: "20px" }}>User added successfully</div>
                        <Button variant="outline" onClick={() => setOpen(false)}><XIcon size={20} />Close</Button>
                    </div>
                </div>}
                {status === "error" && <div className="drawer-mainarea">
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", width: "100%", gap: "15px" }}>
                        <XIcon size={30} />
                        <div style={{ color: "var(--qu-text)", fontSize: "20px" }}>An error occurred while adding the user</div>
                        <Button variant="outline" onClick={() => setOpen(false)}><XIcon size={20} />Close</Button>
                    </div>
                </div>}
                {status === "idle" && <Separator />}
                {status === "idle" && <DrawerFooter style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                    <Button variant="outline" onClick={() => setOpen(false)}><XIcon size={20} />Cancel</Button>
                    <Button disabled={name === "" || username === "" || email === "" || !isEmail(email) || role === ""} onClick={async () => {
                        setStatus("loading");
                        try {
                            await createUser({
                                name,
                                username,
                                email,
                                role,
                                tenantId: session.data?.user?.tenant?.id || "",
                                password,
                                domainId,
                                locationId: isAdmin ? locationId : undefined,
                                departmentIds: isAdmin ? departmentIds : undefined,
                                orgRoleIds: isAdmin ? orgRoleIds : undefined,
                                tags: isAdmin ? parseTagsInput(tagsText) : undefined,
                            });
                            setStatus("success");
                            usersListHook.reload();
                        } catch (error) {
                            setStatus("error");
                        }
                    }}><PlusIcon size={20} />Add</Button>
                </DrawerFooter>}
            </DrawerContent>
        </Drawer>
    );
}
