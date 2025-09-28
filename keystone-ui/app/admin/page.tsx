"use client"
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth";
import { useEffect } from "react";
import { StatCard, StatsRow } from "@/components/statcard";
import { Users, Layers3, AppWindow, Globe } from "lucide-react";
import { useUsersList, useGroupsList, useAdminAppsList, useDomainsList } from "@/lib/admin";
import { useRouter } from "next/navigation";
export default function AdminPage() {
    const session = useSession();
    const users = useUsersList();
    const groups = useGroupsList();
    const apps = useAdminAppsList();
    const domains = useDomainsList();
    const router = useRouter();
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
                <div>
                    <div className="admin-page-title">Admin</div>
                    <div className="admin-page-subtitle">Manage your tenant</div>
                </div>
            </div>
            <div className="mt-4">
                <StatsRow>
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
                </StatsRow>
            </div>
        </motion.div>
    )
}