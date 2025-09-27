
"use client"
import { TenantsTable } from "@/components/tenanttable";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default function UsersPage() {
    return (
        <motion.div className="admin-page" initial={{x: "50px"}} animate={{x: "0px"}} transition={{duration: 0.2, ease: "easeInOut"}}>
            <div className="admin-page-header">
                <div>
                    <div className="admin-page-title">Tenants</div>
                    <div className="admin-page-subtitle">Manage tenants in your tenant</div>
                </div>
                <Button variant="outline">
                    <PlusIcon size={20} />
                    Add Tenant
                </Button>
            </div>
            <TenantsTable />
        </motion.div>
    )
}