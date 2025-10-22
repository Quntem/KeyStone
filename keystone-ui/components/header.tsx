"use client";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { LogOut, useSession } from "@/lib/auth";
import { JSX, useEffect, useRef, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ArrowLeftIcon, ChevronDownIcon, LayoutGrid, LogInIcon, LogOutIcon, MenuIcon, SettingsIcon, SparklesIcon, UserIcon } from "lucide-react";
import { useWindowSize } from "@/lib/screensize";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { AdminSidebar, TeamSidebar, UserSidebar } from "./sidebar";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Launcher } from "./launcher";
import { useTenant } from "@/lib/auth";

export const Header = ({title}: {title: string}) => {
    const session = useSession();
    const router = useRouter();
    const size = useWindowSize();
    const [open, setOpen] = useState(false);
    const path = usePathname();
    const tenant = useTenant();
    useEffect(() => {
        if (session.data?.user && session.loaded) {
            console.log(session.data);
        } else if (session.data?.error) {
            if (session.loaded) {
                window.location.href = process.env.NEXT_PUBLIC_API_URL + "/auth/signin?redirectTo=" + window.location.href;
            }
        }
    }, [session]);
    if (tenant.data?.tenant?.type == "Team" && !path.startsWith("/account")) {
        router.push("/account");
    }
    return (
        <header>
            {/* {tenant.data?.tenant?.type === "Organization" ? <Launcher /> : null} */}
            {tenant.data?.tenant?.logo && <div style={{width: "10px"}} />}
            <SidebarDrawer open={open} onOpenChange={setOpen} />
            {(size.width < 1024 && size.width != 0 && !path.startsWith("/apps")) ? <MenuIcon style={{cursor: "pointer", marginLeft: "5px"}} size="20" onClick={() => {setOpen(true)}} /> : tenant.data?.tenant?.logo ? <><img src={tenant.data?.tenant?.logo} className="header-logo" /><div className="header-logo-divider" /></> : null}
            <div style={{width: "15px"}} />
            {tenant.data?.tenant?.type === "Organization" ? <HeaderDropdown user={session} title={title} /> : <div className="header-title">{title}</div>}
            <div style={{flex: 1}} />
            <HeaderUser />
        </header>
    );
};

export const TeamHeader = ({title}: {title: string}) => {
    const tenant = useTenant();
    const router = useRouter();
    useEffect(() => {
        if (tenant.data?.tenant?.type != "Team" && tenant.loaded) {
            router.push("/admin");
        }
    }, [tenant]);
    const session = useSession();
    const size = useWindowSize();
    const [open, setOpen] = useState(false);
    const path = usePathname();
    useEffect(() => {
        if (session.data?.user && !session.data.error) {
            console.log(session.data);
        } else if (session.data?.error) {
            if (session.loaded) {
                window.location.href = process.env.NEXT_PUBLIC_API_URL + "/auth/signin?redirectTo=" + window.location.href;
            }
        }
    }, [session]);
    return (
        <header>
            {/* <Launcher /> */}
            {/* {urlparams.get("return") ? <Button onClick={() => {window.location.href = urlparams.get("return")}} size={"icon"} variant={"ghost"} style={{marginLeft: "10px"}}><ArrowLeftIcon size={20}/></Button> : null} */}
            <SidebarDrawer open={open} onOpenChange={setOpen} />
            {/* {(size.width < 1024 && size.width != 0 && !path.startsWith("/apps")) ? <MenuIcon style={{cursor: "pointer", marginLeft: "5px"}} size="20" onClick={() => {setOpen(true)}} /> : session.data?.user?.tenant?.logo ? <><img src={session.data?.user?.tenant?.logo} className="header-logo" /><div className="header-logo-divider" /></> : null} */}
            <div style={{width: "15px"}} />
            {/* <HeaderDropdown user={session} title={title} /> */}
            <div className="header-title">{title}</div>
            <div style={{flex: 1}} />
            <HeaderUser />
        </header>
    );
};

function HeaderDropdown({user, title}: {user: any, title: string}) {
    const router = useRouter();
    const path = usePathname();
    const triggerRef = useRef<HTMLDivElement>(null);
    return (
        <DropdownMenu>
            <DropdownMenuTrigger style={{display: "flex", alignItems: "center", gap: "5px", outline: "none"}} ref={triggerRef}>
                <div className="header-title">{title}</div>
                <ChevronDownIcon size="20" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="center" sideOffset={20} style={{width: triggerRef.current?.offsetWidth}}>
                {!path.startsWith("/account") ? <DropdownMenuItem style={{fontFamily: "Figtree", fontSize: "16px", color: "var(--qu-text)"}} onClick={() => {router.push("/account")}}><UserIcon size={20}/>Account</DropdownMenuItem> : null}
                {!path.startsWith("/apps") ? <DropdownMenuItem style={{fontFamily: "Figtree", fontSize: "16px", color: "var(--qu-text)"}} onClick={() => {router.push("/apps")}}><LayoutGrid size={20}/>Apps</DropdownMenuItem> : null}
                {(user?.data?.user?.role === "ADMIN" && !path.startsWith("/admin")) ? <DropdownMenuItem style={{fontFamily: "Figtree", fontSize: "16px", color: "var(--qu-text)"}} onClick={() => {router.push("/admin")}}><SettingsIcon size={20}/>Admin</DropdownMenuItem> : null}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function SidebarDrawer({open, onOpenChange}: {open: boolean, onOpenChange: (open: boolean) => void}) {
    const path = usePathname();
    return (
        <Drawer direction="left" open={open} onOpenChange={onOpenChange}>
            <DrawerContent style={{width: "250px"}}>
                {path.startsWith("/admin") ? <AdminSidebar ignoreSize /> : path.startsWith("/team") ? <TeamSidebar ignoreSize /> : <UserSidebar ignoreSize />}
            </DrawerContent>
        </Drawer>
    );
}

export function UserItem({user, Extra, onClick}: {user: any, Extra?: JSX.Element, onClick?: () => void}) {
    return (
        <div className="flex items-center gap-2" onClick={onClick}>
            <Avatar className="border border-[var(--qu-border-color)]" style={{fontSize: "14px", fontWeight: "400"}}>
                <AvatarFallback style={{color: "var(--qu-text)"}}>{user.name.charAt(0).toUpperCase() + user.name.charAt(1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold text-sm color-[var(--qu-text)]">{user.name}</span>
                <span className="truncate opacity-70 text-xs color-[var(--qu-text-secondary)]">{user.email}</span>
            </div>
            {Extra}
        </div>
    );
}

function HeaderUser() {
    const session = useSession();
    const size = useWindowSize();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="header-user-container-outer">
                    {(size.width < 550 && size.width != 0) ? null : <div className="header-user-container">
                        <div className="header-user-text">{session.data?.user?.name} ({session.data?.user?.tenant?.name + "/" + session.data?.user?.username})</div>
                        <div className="header-company-text">{session.data?.user?.email} ({session.data?.user?.tenant?.name})</div>
                    </div>}
                    <Avatar style={{width: "30px", height: "30px", marginRight: "10px", border: "1px solid var(--qu-border-color)"}}>
                        <AvatarFallback style={{color: "var(--qu-text)"}}>{session.data?.user?.name.charAt(0).toUpperCase() + session.data?.user?.name.charAt(1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" sideOffset={20} alignOffset={10}>
                <div className="p-2">
                    <UserItem user={session.data?.user} />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="color-[var(--qu-text)]" onClick={() => {LogOut().then(() => {window.location.href = process.env.NEXT_PUBLIC_API_URL + "/auth/signin?redirectTo=" + window.location.href})}}><LogOutIcon size={20}/>Logout</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function InfoHeader() {
    const router = useRouter();
    return (
        <header>
            <div style={{width: "15px"}} />
            <div className="header-title">Quntem KeyStone</div>
            <div style={{flex: 1}} />
            <Button size="sm" variant="outline" style={{marginRight: "10px"}} onClick={() => {router.push("/account")}}><LogInIcon size={20}/>Access My Account</Button>
            <Button size="sm" style={{marginRight: "10px"}} onClick={() => {router.push("/get-started")}}><SparklesIcon size={20}/>Get Started</Button>
        </header>
    );
}

export function GetStartedHeader() {
    return (
        <header>
            <div style={{width: "15px"}} />
            <div className="header-title">Quntem KeyStone</div>
            <div style={{flex: 1}} />
        </header>
    );
}
    