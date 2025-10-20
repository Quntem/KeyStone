
"use client"
import { motion } from "framer-motion";
import { SetLogo, SetDescription, SetDisplayName } from "@/components/infromationEdit";
import { useTenant } from "@/lib/auth";

export default function UsersPage() {
    const tenant = useTenant();
    return (
        <motion.div className="admin-page" initial={{x: "50px"}} animate={{x: "0px"}} transition={{duration: 0.2, ease: "easeInOut"}}>
            <div className="admin-page-header">
                <div>
                    <div className="admin-page-title">Information</div>
                    <div className="admin-page-subtitle">Manage how your tenant is displayed</div>
                </div>
            </div>
            {tenant.data?.tenant && <div className="admin-page-content" style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                <SetLogo defaultLogo={tenant.data?.tenant?.logo || ""} />
                <SetDisplayName defaultDisplayName={tenant.data?.tenant?.displayName || ""} />
                <SetDescription defaultDescription={tenant.data?.tenant?.description || ""} />
            </div>}
        </motion.div>
    )
}