
"use client"
import { TenantsTable } from "@/components/tenanttable";
import { motion } from "framer-motion";

export default function UsersPage() {
    return (
        <motion.div className="admin-page" initial={{x: "50px"}} animate={{x: "0px"}} transition={{duration: 0.2, ease: "easeInOut"}}>
            <div className="admin-page-title">Groups</div>
            <div className="admin-page-subtitle">Manage groups in your tenant</div>
        </motion.div>
    )
}