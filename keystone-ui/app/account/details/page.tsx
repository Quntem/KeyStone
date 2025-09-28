"use client"
import { motion } from "framer-motion";
import { SessionTable } from "@/components/sessiontable";
import { SetDisplayName } from "@/components/infromationEdit";
import { useSession } from "@/lib/auth";

export default function AccountPage() {
    const session = useSession();
    return (
        <motion.div className="admin-page" initial={{x: "50px"}} animate={{x: "0px"}} transition={{duration: 0.2, ease: "easeInOut"}}>
            <div className="admin-page-header">
                <div>
                    <div className="admin-page-title">Details</div>
                    <div className="admin-page-subtitle">Manage your details</div>
                </div>
            </div>
            {session.data?.user && <SetDisplayName defaultDisplayName={session.data?.user?.name} />}
        </motion.div>
    )
}