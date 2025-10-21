
"use client"
import { UsersTable } from "@/components/userstable";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { AddUserDrawer } from "@/components/userstable";
import { useUsersList } from "@/lib/admin";
import { useState } from "react";

export default function UsersPage() {
    const [open, setOpen] = useState(false);
    const usersListHook = useUsersList();
    return (
        <motion.div className="admin-page" initial={{x: "50px"}} animate={{x: "0px"}} transition={{duration: 0.2, ease: "easeInOut"}}>
            <div className="admin-page-header">
                <div>
                    <div className="admin-page-title">Users</div>
                    <div className="admin-page-subtitle">Manage users in your tenant</div>
                </div>
                <AddUserDrawer open={open} setOpen={setOpen} usersListHook={usersListHook} />
            </div>
            <UsersTable usersListHook={usersListHook} />
        </motion.div>
    )
}