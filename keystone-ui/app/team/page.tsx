"use client"
import { motion } from "framer-motion";
import { useSession, UseUserAppAccess } from "@/lib/auth";
import { useEffect } from "react";
import { StatCard, StatsRow } from "@/components/statcard";
import { Users, Layers3, AppWindow, Globe, TriangleAlertIcon, GlobeIcon, PenIcon } from "lucide-react";
import { useUsersList, useGroupsList, useAdminAppsList, useDomainsList } from "@/lib/admin";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AppChip } from "@/components/apps";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
export default function AdminPage() {
    const session = useSession();
    const users = useUsersList();
    const groups = useGroupsList();
    const apps = UseUserAppAccess();
    const domains = useDomainsList();
    const router = useRouter();
    useEffect(() => {
        console.log(domains.data)
    }, [domains]);
    useEffect(() => {
        if (session.data?.user?.role !== "ADMIN" && session.data?.user) {
            window.location.href = "/account";
        }
    }, [session]);
    const usersCount = users.loaded ? (((users as any)?.data?.users?.length) ?? 0) : "—";
    const groupsCount = groups.loaded ? ((((groups as any)?.data)?.length) ?? 0) : "—";
    const appsCount = apps.loaded ? ((((apps as any)?.data)?.length) ?? 0) : "—";
    const domainsCount = domains.loaded ? ((((domains as any)?.data)?.length) ?? 0) : "—";
    return (
        <motion.div className="admin-page" initial={{x: "50px"}} animate={{x: "0px"}} transition={{duration: 0.2, ease: "easeInOut"}} >
            <div className="admin-page-header">
                <div className="w-full flex items-center justify-center mt-5">
                    <div className="admin-page-title">Hello {session.data?.user?.name} 👋, welcome to {session.data?.user?.tenant?.displayName || session.data?.user?.tenant?.name}'s dashboard</div>
                </div>
            </div>
            <div className="flex flex-row align-center justify-center">
                {apps.loaded ? apps.data?.map((app: any) => {
                    return <AppChip key={app.id} app={app.app}/>
                }) : null}
            </div>
            <div className="mt-4 flex flex-row align-center justify-center">
                {/* <StatsRow>
                    <StatCard onClick={() => {
                        router.push("/admin/users");
                    }} title="Users" value={usersCount} icon={<Users size={20} />} />
                    <StatCard onClick={() => {
                        router.push("/admin/groups");
                    }} title="Groups" value={groupsCount} icon={<Layers3 size={20} />} />
                    <StatCard onClick={() => {
                        router.push("/admin/apps");
                    }} title="Apps" value={appsCount} icon={<AppWindow size={20} />} />
                    <StatCard onClick={() => {
                        router.push("/admin/domains");
                    }} title="Domains" value={domainsCount} icon={<Globe size={20} />} />
                </StatsRow> */}
                <div style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                    <Card style={{maxWidth: "500px", width: "500px"}}>
                        <CardHeader>
                            <CardTitle style={{display: "flex", alignItems: "center", gap: "5px", fontSize: "20px", color: "var(--qu-text)", fontWeight: "500"}}>{session.data?.user?.tenant?.displayName || session.data?.user?.tenant?.name}<PenIcon size={16} onClick={() => {
                                router.push("/team/settings");
                            }} /></CardTitle>
                            <CardDescription>Quntem KeyStone For Teams</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card onClick={() => {
                        router.push("/team/users");
                    }} style={{maxWidth: "500px", width: "500px"}}>
                        <CardHeader>
                            <CardTitle style={{display: "flex", alignItems: "center", gap: "5px", fontSize: "20px", color: "var(--qu-text)", fontWeight: "500"}}>Manage Users</CardTitle>
                            <CardDescription>{usersCount} Users</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card onClick={() => {
                        router.push("/team/apps");
                    }} style={{maxWidth: "500px", width: "500px"}}>
                        <CardHeader>
                            <CardTitle style={{display: "flex", alignItems: "center", gap: "5px", fontSize: "20px", color: "var(--qu-text)", fontWeight: "500"}}>Manage Apps</CardTitle>
                            <CardDescription>{appsCount} Apps</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </motion.div>
    )
}