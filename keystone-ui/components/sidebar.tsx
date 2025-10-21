"use client";
import { BuildingIcon, GlobeIcon, Grid2X2Icon, HomeIcon, IdCardLanyardIcon, LaptopMinimalIcon, LayoutDashboard, LayoutGrid, LayoutGridIcon, PenIcon, SettingsIcon, ShieldIcon, UserIcon, UsersIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession, useTenant } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { useWindowSize } from "@/lib/screensize";
import { info } from "@/lib/utils";

export const UserSidebar = ({ignoreSize}: {ignoreSize?: boolean}) => {
    const session = useSession();
    const router = useRouter();
    const path = usePathname();
    const tenant = useTenant();
    const size = useWindowSize();
    if (!ignoreSize && (size.width < 1024 && size.width != 0)) {
        return null
    }
    return (
        <div className="sidebar">
            <SidebarUserItem />
            <SidebarItem title="Home" onClick={() => {router.push("/account")}} Icon={HomeIcon} active={path === "/account"} index={0} />
            <SidebarItem title="Details" onClick={() => {router.push("/account/details")}} Icon={IdCardLanyardIcon} active={path === "/account/details"} index={1} />
            <SidebarItem title="Security" onClick={() => {router.push("/account/security")}} Icon={ShieldIcon} active={path === "/account/security"} index={2} />
            <SidebarItem title="Sessions" onClick={() => {router.push("/account/sessions")}} Icon={LaptopMinimalIcon} active={path === "/account/sessions"} index={3} />
            <Separator style={{margin: "10px 0px"}} />
            {tenant.data?.tenant?.type === "Organization" && <SidebarItem title="Your Apps" onClick={() => {router.push("/apps")}} Icon={LayoutGrid} active={false} index={4} />}
            {session.data?.user?.role === "ADMIN" && tenant.data?.tenant?.type === "Organization" ? <SidebarItem title="Admin" onClick={() => {router.push("/admin")}} Icon={SettingsIcon} active={false} index={5} /> : <SidebarItem title="Team Dashboard" onClick={() => {router.push("/team")}} Icon={LayoutDashboard} active={false} index={5} />}
            <Separator style={{margin: "10px 0px"}} />
            <SidebarFooter index={session.data?.user?.role === "ADMIN" ? 6 : 5} />
        </div>
    );
};

export const AdminSidebar = ({ignoreSize}: {ignoreSize?: boolean}) => {
    const path = usePathname();
    const router = useRouter();
    const tenant = useTenant();
    const size = useWindowSize();
    if (!ignoreSize && (size.width < 1024 && size.width != 0)) {
        return null
    }
    return (
        <div className="sidebar">
            <div className="sidebar-tenant-name">
                {tenant.data?.tenant?.displayName || tenant.data?.tenant?.name}
            </div>
            <SidebarItem title="Home" onClick={() => {router.push("/admin")}} Icon={HomeIcon} active={path === "/admin"} index={0} />
            <SidebarItem title="Information" onClick={() => {router.push("/admin/information")}} Icon={PenIcon} active={path === "/admin/information"} index={1} />
            <SidebarItem title="Users" onClick={() => {router.push("/admin/users")}} Icon={IdCardLanyardIcon} active={path === "/admin/users"} index={2} />
            {/* <SidebarItem title="Tenants" onClick={() => {router.push("/admin/tenants")}} Icon={BuildingIcon} active={path === "/admin/tenants"} index={3} /> */}
            <SidebarItem title="Groups" onClick={() => {router.push("/admin/groups")}} Icon={UsersIcon} active={path === "/admin/groups"} index={4} />
            <SidebarItem title="Domains" onClick={() => {router.push("/admin/domains")}} Icon={GlobeIcon} active={path === "/admin/domains"} index={5} />
            <SidebarItem title="Apps" onClick={() => {router.push("/admin/apps")}} Icon={LayoutGridIcon} active={path === "/admin/apps"} index={6} />
            <Separator style={{margin: "10px 0px"}} />
            <SidebarItem title="Your Account" onClick={() => {router.push("/account")}} Icon={UserIcon} active={false} index={7} />
            <SidebarItem title="Your Apps" onClick={() => {router.push("/apps")}} Icon={LayoutGrid} active={false} index={8} />
            <Separator style={{margin: "10px 0px"}} />
            <SidebarFooter index={9} />
        </div>
    );
};

export const TeamSidebar = ({ignoreSize}: {ignoreSize?: boolean}) => {
    const path = usePathname();
    const router = useRouter();
    const tenant = useTenant();
    const size = useWindowSize();
    if (!ignoreSize && (size.width < 1024 && size.width != 0)) {
        return null
    }
    return (
        <div className="sidebar">
            {/* <div className="sidebar-tenant-name">
                {tenant.data?.tenant?.displayName || tenant.data?.tenant?.name}
            </div> */}
            <SidebarItem title="Overview" onClick={() => {router.push("/team")}} Icon={HomeIcon} active={path === "/team"} index={0} />
            <SidebarItem title="Users" onClick={() => {router.push("/team/users")}} Icon={IdCardLanyardIcon} active={path === "/team/users"} index={1} />
            {/* <SidebarItem title="Groups" onClick={() => {router.push("/team/groups")}} Icon={UsersIcon} active={path === "/team/groups"} index={2} /> */}
            <SidebarItem title="Apps" onClick={() => {router.push("/team/apps")}} Icon={LayoutGridIcon} active={path === "/team/apps"} index={2} />
            <SidebarItem title="Settings" onClick={() => {router.push("/team/settings")}} Icon={SettingsIcon} active={path === "/team/settings"} index={3} />
            {/* <Separator style={{margin: "10px 0px"}} /> */}
            {/* <SidebarItem title="Your Account" onClick={() => {router.push("/account")}} Icon={UserIcon} active={false} index={7} />
            <SidebarItem title="Your Apps" onClick={() => {router.push("/apps")}} Icon={LayoutGrid} active={false} index={8} /> */}
            <Separator style={{margin: "10px 0px"}} />
            <SidebarFooter index={4} />
        </div>
    );
};

function SidebarUserItem() {
    const session = useSession();
    return (
        <div className="sidebar-user-item">
            <Avatar style={{width: "40px", height: "40px", marginRight: "7px", border: "1px solid #e4e4e7"}}>
                <AvatarFallback>{session.data?.user?.name?.charAt(0).toUpperCase()}{session.data?.user?.name?.charAt(1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
                <div className="sidebar-user-item-name">{session.data?.user?.name}</div>
                <div className="sidebar-user-item-tenant">{session.data?.user?.tenant?.name + "/" + session.data?.user?.username}</div>
            </div>
        </div>
    );
}

function SidebarItem({title, onClick, Icon, active, index}: {title: string, onClick: () => void, Icon: React.JSX.ElementType, active: boolean, index: number}) {
    return (
        <motion.div className={"sidebar-item" + (active ? " sidebar-item-active" : "")} onClick={onClick} initial={{x: "-100%" }} animate={{x: "0%"}}  transition={{duration: 0.5, delay: index * 0.1}}>
            {active && <motion.div
                key={`tabbar-animated-` + index}
                layoutId="tabbar-animated"
                className="sidebar-item-animated"
                transition={{
                    ease: "easeInOut",

                }}
            />}
            <Icon size="20" />
            <div>{title}</div>
        </motion.div>
    );
}

function SidebarFooter({index}: {index: number}) {
    return (
        <motion.div className="sidebar-footer" initial={{x: "-100%" }} animate={{x: "0%"}}  transition={{duration: 0.5, delay: index * 0.1}}>
            <div className="sidebar-footer-text">
                Quntem Keystone
            </div>
            <div className="sidebar-footer-version">
                Version {info.version}
            </div>
            <div className="sidebar-footer-extrainfo">
                <a href="https://github.com/quntem/keystone" target="_blank" style={{textDecoration: "underline"}} rel="noreferrer">GitHub</a>
            </div>
        </motion.div>
    );
}
    