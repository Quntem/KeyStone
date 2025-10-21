
"use client"
import { motion } from "framer-motion";
import { useGroupsList } from "@/lib/admin";
import { GroupsTable, CreateGroupDrawer } from "@/components/groupstable";
import { useState } from "react";

export default function UsersPage() {
    const groupsListHook = useGroupsList();
    const [createGroupOpen, setCreateGroupOpen] = useState(false);
    return (
        <motion.div className="admin-page" initial={{x: "50px"}} animate={{x: "0px"}} transition={{duration: 0.2, ease: "easeInOut"}}>
            <div className="admin-page-header">
                <div>
                    <div className="admin-page-title">Groups</div>
                    <div className="admin-page-subtitle">Manage groups in your tenant</div>
                </div>
                <CreateGroupDrawer open={createGroupOpen} setOpen={setCreateGroupOpen} groupsListHook={groupsListHook} />
            </div>
            <GroupsTable groupsListHook={groupsListHook} />
        </motion.div>
    )
}