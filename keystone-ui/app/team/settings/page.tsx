
"use client"
import { motion } from "framer-motion";
import { SetLogo, SetDescription, SetDisplayName } from "@/components/infromationEdit";
import { useDomainExists, useTenant } from "@/lib/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GlobeIcon, KeyRoundIcon, LayoutGridIcon, ArrowUpIcon, XIcon, TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSession } from "@/lib/auth";
import { CommonPersonalDomains } from "@/lib/CommonPersonalDomain";
import { useEffect, useState } from "react";

export default function UsersPage() {
    const tenant = useTenant();
    return (
        <motion.div className="admin-page" initial={{x: "50px"}} animate={{x: "0px"}} transition={{duration: 0.2, ease: "easeInOut"}}>
            <div className="admin-page-header">
                <div>
                    <div className="admin-page-title">Settings</div>
                    <div className="admin-page-subtitle">Manage your team</div>
                </div>
            </div>
            <div style={{display: "flex", flexDirection: "row", gap: "40px"}}>
                <SettingsPageItems />
                <UpgradeToFullTenant />
            </div>
        </motion.div>
    )
}

export function SettingsPageItems() {
    const tenant = useTenant();
    return (
        tenant.data?.tenant && <div className="admin-page-content" style={{display: "flex", flexDirection: "column", gap: "20px", width: "50%"}}>
                {/* <SetLogo defaultLogo={tenant.data?.tenant?.logo || ""} /> */}
                <Alert>
                    <KeyRoundIcon />
                    <AlertTitle>Why can everyone add users?</AlertTitle>
                    <AlertDescription>KeyStone For Teams is designed for small teams inside of organizations, so everyone in the team can add users. If you want to limit this, you can verify your domain and convert to a full tenant (it's Free!)</AlertDescription>
                </Alert>
                <SetDisplayName defaultDisplayName={tenant.data?.tenant?.displayName || ""} />
                <SetDescription defaultDescription={tenant.data?.tenant?.description || ""} />
        </div>
    )
}

export function UpgradeToFullTenant() {
    const session = useSession();
    const domainExists = useDomainExists(session.data?.user?.email.split("@")[1]);
    const [isPersonalDomain, setIsPersonalDomain] = useState(false);
    useEffect(() => {
        if (CommonPersonalDomains.includes(session.data?.user?.email.split("@")[1])) {
            setIsPersonalDomain(true);
        }
    }, [session.data?.user?.email]);
    return (
        <div className="admin-page-content" style={{display: "flex", flexDirection: "column", gap: "15px", width: "500px"}}>
            <div style={{display: "flex", flexDirection: "column", gap: "5px"}}>
                <img src="/icon.svg" style={{width: "40px", height: "40px"}} />
                <div className="text-2xl font-semibold" style={{color: "var(--qu-text)"}}>Upgrade to a Full Tenant</div>
                <div className="text-sm" style={{color: "var(--qu-text-secondary)"}}>Upgrade to a full tenant to unlock more features of KeyStone</div>
            </div>
            <Alert>
                <KeyRoundIcon />
                <AlertTitle>User Management</AlertTitle>
                <AlertDescription>Manage users in your team, and limit who can add users</AlertDescription>
            </Alert>
            {/* <Alert>
                <GlobeIcon />
                <AlertTitle>Claim Domain</AlertTitle>
                <AlertDescription>Claim your domain to prevent users from creating teams with their email</AlertDescription>
            </Alert> */}
            {domainExists && <Alert variant="destructive" style={{width: "500px", marginBottom: "25px"}}>
                <TriangleAlertIcon/>
                <AlertTitle>Domain already exists</AlertTitle>
                <AlertDescription>You already have a tenant with this domain</AlertDescription>
            </Alert>}
            {isPersonalDomain && <Alert variant="destructive" style={{width: "500px", marginBottom: "25px"}}>
                <TriangleAlertIcon/>
                <AlertTitle>Personal Domain</AlertTitle>
                <AlertDescription>You cannot upgrade a personal domain</AlertDescription>
            </Alert>}
            <Alert>
                <LayoutGridIcon />
                <AlertTitle>Create Apps</AlertTitle>
                <AlertDescription>Create internal apps for your organization, or share them with the world</AlertDescription>
            </Alert>
            <Dialog>
                <DialogTrigger asChild><Button variant="outline"><ArrowUpIcon />Start Migration</Button></DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Start Migration</DialogTitle>
                        <DialogDescription>Start the migration to a full tenant, just verify your domain and you're good to go!</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline"><XIcon />Cancel</Button>
                        </DialogClose>
                        <Button disabled={domainExists || isPersonalDomain} onClick={() => {
                            fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/upgradetofulltenant", {
                                credentials: "include",
                                redirect: "manual",
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Accept": "application/json",
                                },
                                body: JSON.stringify({domain: session.data?.user?.email.split("@")[1]})
                            }).then(res => {
                                return res.json();
                            }).then(async data => {
                                window.location.href = "/admin";
                            });
                        }}><ArrowUpIcon />Start Migration</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
    