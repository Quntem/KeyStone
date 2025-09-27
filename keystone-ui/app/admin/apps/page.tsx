
"use client"
import { AppsTable } from "@/components/appstable";
import { motion } from "framer-motion";
import { useAdminAppsList } from "@/lib/admin";
import { useState } from "react";
import { AddAppDrawer } from "@/components/appstable";

export default function AppsPage() {
    const appsListHook = useAdminAppsList();
    const [addAppOpen, setAddAppOpen] = useState(false);
    return (
        <motion.div className="admin-page" initial={{x: "50px"}} animate={{x: "0px"}} transition={{duration: 0.2, ease: "easeInOut"}}>
            <div className="admin-page-header">
                <div>
                    <div className="admin-page-title">Apps</div>
                    <div className="admin-page-subtitle">Manage apps in your tenant</div>
                </div>
                <AddAppDrawer open={addAppOpen} setOpen={setAddAppOpen} appsListHook={appsListHook} />
            </div>
            <AppsTable appsListHook={appsListHook} />
        </motion.div>
    )
}