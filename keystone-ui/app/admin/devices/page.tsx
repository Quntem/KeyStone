
"use client"
import { motion } from "framer-motion";
import { useDevicesList } from "@/lib/admin";
import { DevicesTable } from "@/components/devicestable";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";

export default function DevicesPage() {
    const [open, setOpen] = useState(false);
    const devicesList = useDevicesList();
    return (
        <motion.div className="admin-page" initial={{ x: "50px" }} animate={{ x: "0px" }} transition={{ duration: 0.2, ease: "easeInOut" }}>
            <div className="admin-page-header">
                <div>
                    <div className="admin-page-title">Devices</div>
                    <div className="admin-page-subtitle">Manage your devices</div>
                </div>
                {/* <AddDomainDrawer open={open} setOpen={setOpen} domainsListHook={domainsList} /> */}
            </div>
            <DevicesTable devicesListHook={devicesList} />
        </motion.div>
    )
}