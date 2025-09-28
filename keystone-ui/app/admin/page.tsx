"use client"
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth";
import { useEffect } from "react";

export default function AdminPage() {
    const session = useSession();
    useEffect(() => {
        if (session.data?.user?.role !== "ADMIN" && session.data?.user) {
            window.location.href = "/account";
        }
    }, [session]);
    return (
        <motion.div className="admin-page" initial={{x: "50px"}} animate={{x: "0px"}} transition={{duration: 0.2, ease: "easeInOut"}} >
            <div className="admin-page-title">Admin</div>
            <div className="admin-page-subtitle">Manage your tenant</div>
        </motion.div>
    )
}