"use client"
import { motion } from "framer-motion";
import { SessionTable } from "@/components/sessiontable";

export default function AccountPage() {
    return (
        <motion.div className="admin-page" initial={{x: "50px"}} animate={{x: "0px"}} transition={{duration: 0.2, ease: "easeInOut"}}>
            <div className="admin-page-header">
                <div>
                    <div className="admin-page-title">Sessions</div>
                    <div className="admin-page-subtitle">Manage your sessions</div>
                </div>
            </div>
            <SessionTable />
        </motion.div>
    )
}