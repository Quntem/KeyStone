"use client"
import { motion } from "framer-motion";

export default function AdminPage() {
    return (
        <motion.div className="admin-page" initial={{x: "50px"}} animate={{x: "0px"}} transition={{duration: 0.2, ease: "easeInOut"}} >
            <div className="admin-page-title">Admin</div>
            <div className="admin-page-subtitle">Manage your tenant</div>
        </motion.div>
    )
}