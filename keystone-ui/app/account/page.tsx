"use client"
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth";
import { UserInfoCard } from "@/components/user-info-card";

export default function UserPage() {
    const session = useSession();
    const user = (session as any)?.data?.user || {};
    const tenant = (session as any)?.data?.user?.tenant || {};
    const username: string = user.username || user.userName || (user.email ? String(user.email).split("@")[0] : "");
    const displayName: string = user.name || user.displayName || "";
    const email: string = user.email || "";
    const role: string = user.role || (Array.isArray(user.roles) ? (user.roles[0]?.name || user.roles[0] || "") : "");
    const tenantName: string = tenant.name || tenant.tenantName || tenant.id || "";
    return (
        <motion.div className="admin-page" initial={{x: "50px"}} animate={{x: "0px"}} transition={{duration: 0.2, ease: "easeInOut"}} >
            <div className="admin-page-header">
                <div>
                    <div className="admin-page-title">Your Account</div>
                    <div className="admin-page-subtitle">Manage your account</div>
                </div>
            </div>
            <div className="mt-4">
                <UserInfoCard
                    title="Your information"
                    username={username}
                    displayName={displayName}
                    tenant={tenantName}
                    role={role}
                    email={email}
                />
            </div>
        </motion.div>
    )
}