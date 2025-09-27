
"use client"
import { TenantsTable } from "@/components/tenanttable";
import { motion } from "framer-motion";

export default function DomainsPage() {
    return (
        <motion.div className="admin-page" initial={{x: "50px"}} animate={{x: "0px"}} transition={{duration: 0.2, ease: "easeInOut"}}>
            <div className="admin-page-title">Domains</div>
            <div className="admin-page-subtitle">Manage your domains</div>
        </motion.div>
    )
}