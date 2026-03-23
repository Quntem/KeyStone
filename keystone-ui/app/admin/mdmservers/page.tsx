
"use client"
import { motion } from "framer-motion";
import { useDevicesList } from "@/lib/admin";
import { DevicesTable } from "@/components/devicestable";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { AddMDMDrawer, MDMsTable } from "@/components/mdmstable";
import { useMDMServersList } from "@/lib/admin";

export default function DevicesPage() {
    const [open, setOpen] = useState(false);
    const mdmsList = useMDMServersList();
    return (
        <motion.div className="admin-page" initial={{ x: "50px" }} animate={{ x: "0px" }} transition={{ duration: 0.2, ease: "easeInOut" }}>
            <div className="admin-page-header">
                <div>
                    <div className="admin-page-title">MDM Servers</div>
                    <div className="admin-page-subtitle">Manage your MDM servers</div>
                </div>
                <AddMDMDrawer open={open} setOpen={setOpen} mdmsListHook={mdmsList} />
            </div>
            <MDMsTable mdmsListHook={mdmsList} />
        </motion.div>
    )
}