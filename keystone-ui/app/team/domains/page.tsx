
"use client"
import { motion } from "framer-motion";
import { useDomainsList } from "@/lib/admin";
import { DomainsTable } from "@/components/domainstable";
import { Toaster } from "@/components/ui/sonner";
import { AddDomainDrawer } from "@/components/domainstable";
import { useState } from "react";

export default function DomainsPage() {
    const [open, setOpen] = useState(false);
    const domainsList = useDomainsList();
    return (
        <motion.div className="admin-page" initial={{x: "50px"}} animate={{x: "0px"}} transition={{duration: 0.2, ease: "easeInOut"}}>
            <div className="admin-page-header">
                <div>
                    <div className="admin-page-title">Domains</div>
                    <div className="admin-page-subtitle">Manage your domains</div>  
                </div>
                <AddDomainDrawer open={open} setOpen={setOpen} domainsListHook={domainsList} />
            </div>
            <DomainsTable domainsListHook={domainsList} />
        </motion.div>
    )
}