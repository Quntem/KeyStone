"use client"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BanknoteXIcon, KeyRoundIcon, LayoutGridIcon, MailIcon, TriangleAlertIcon } from "lucide-react";
import { InputField, PrefixedInput, SuffixedInput } from "@/components/userstable";
import { useEffect, useState } from "react";
import { useEmailExists, useDomainExists, useTenantExists } from "@/lib/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import isEmail from "is-email";
import { createDomain } from "@/lib/admin";
import { CommonPersonalDomains } from "@/lib/CommonPersonalDomain";

export function TeamGetStartedCard() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [tenantName, setTenantName] = useState("");
    useEffect(() => {
        const trimmedName = tenantName.trim().toLowerCase();
            const validName = trimmedName.replaceAll(/[^a-z0-9-_]/g, "");
            setTenantName(validName);
    }, [tenantName]);
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const tenantExists = useTenantExists(tenantName);
    const [canJoin, setCanJoin] = useState(false);
    useEffect(() => {
        if (!CommonPersonalDomains.includes(email.split("@")[1]) && isEmail(email)) {
            setCanJoin(true);
        } else {
            setCanJoin(false);
        }
    }, [email]);
    const [domain, setDomain] = useState("");
    const emailExists = useEmailExists(email);
    return <div>
        {tenantExists && <Alert variant="destructive" style={{width: "500px", marginBottom: "25px"}}>
            <TriangleAlertIcon/>
            <AlertTitle>Tenant already exists</AlertTitle>
            <AlertDescription>Please choose a different tenant name</AlertDescription>
        </Alert>}
        {emailExists && <Alert variant="destructive" style={{width: "500px", marginBottom: "25px"}}>
            <TriangleAlertIcon/>
            <AlertTitle>Email already exists</AlertTitle>
            <AlertDescription>Please choose a different email</AlertDescription>
        </Alert>}
        {!isEmail(email) && <Alert variant="destructive" style={{width: "500px", marginBottom: "25px"}}>
            <TriangleAlertIcon/>
            <AlertTitle>Invalid email</AlertTitle>
            <AlertDescription>Please enter a valid email</AlertDescription>
        </Alert>}
        {CommonPersonalDomains.includes(email.split("@")[1]) && isEmail(email) && <Alert variant="destructive" style={{width: "500px", marginBottom: "25px"}}>
            <TriangleAlertIcon/>
            <AlertTitle>Personal email</AlertTitle>
            <AlertDescription>You can use this email, but it's recommended to use a work email</AlertDescription>
        </Alert>}
        <Card style={{width: "500px"}}>
            <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>Get Started with Quntem KeyStone For Teams for free</CardDescription>
            </CardHeader>
            <div>
                <InputField style={{padding: "0px 25px 25px 25px"}} label="Tenant Name" value={tenantName} setValue={setTenantName}/>
                <PrefixedInput style={{padding: "0px 25px 25px 25px"}} label="Username" value={username} setValue={setUsername} prefix={tenantName + "/"}/>
                {/* <InputField style={{padding: "0px 25px 25px 25px"}} label="Domain" value={domain} setValue={setDomain}/> */}
                <InputField extraInfo={canJoin ? "Anyone with a " + email.split("@")[1] + " email can join your team" : null} autoComplete="new-password" style={{padding: "0px 25px 25px 25px"}} label="Email" value={email} setValue={setEmail}/>
                {/* <SuffixedInput style={{padding: "0px 25px 25px 25px"}} label="Email" value={email} setValue={setEmail} suffix={"@" + domain}/> */}
                <InputField type="password" autoComplete="new-password" style={{padding: "0px 25px 25px 25px"}} label="Password" value={password} setValue={setPassword}/>
                <InputField style={{padding: "0px 25px 25px 25px"}} label="Your Name" value={name} setValue={setName}/>
            </div>
            <CardFooter style={{display: "flex", justifyContent: "flex-end"}}>
                <Button disabled={tenantExists || !tenantName || !username || !email || !password || !isEmail(email)} onClick={() => {
                    fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/setupteam", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                        },
                        body: JSON.stringify({tenantName, username, email, password, name})
                    }).then(res => {
                        return res.json();
                    }).then(async data => {
                        window.location.href = "/team";
                    });
                }}><KeyRoundIcon size={20}/> Get Started</Button>
            </CardFooter>
        </Card>
    </div>;
}

function TeamGetStartedInfo() {
    return <div style={{width: "500px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "5px"}}>
        <img src="/teams.svg" alt="KeyStone Logo" style={{width: "40px", height: "40px"}}/>
        <h1 className="text-2xl font-bold" style={{color: "var(--qu-text)"}}>KeyStone For Teams</h1>
        <p className="text-lg" style={{color: "var(--qu-text)"}}>Get Started with Quntem KeyStone for teams, a free identity and access management platform for teams inside your organization. <span className="text-lg" style={{color: "var(--qu-text-secondary)"}}>Use your existing company email to get started, no domain setup or IT help required</span></p>
        <Alert style={{width: "500px", marginTop: "15px"}}>
            <LayoutGridIcon/>
            <AlertTitle>Get Software</AlertTitle>
            <AlertDescription>Start adding apps to your tenant and manage your users and groups</AlertDescription>
        </Alert>
        <Alert style={{width: "500px", marginTop: "15px"}}>
            <MailIcon/>
            <AlertTitle>Use your existing company email</AlertTitle>
            <AlertDescription>All you need is your existing company email to get started</AlertDescription>
        </Alert>
        <Alert style={{width: "500px", marginTop: "15px"}}>
            <BanknoteXIcon/>
            <AlertTitle>Free tools</AlertTitle>
            <AlertDescription>Start using a suite of free tools to empower your team to do their job</AlertDescription>
        </Alert>
        <Alert style={{width: "500px", marginTop: "15px"}}>
            <KeyRoundIcon/>
            <AlertTitle>Upgrade Anytime</AlertTitle>
            <AlertDescription>Add a domain to get a full tenant for free, and unlock more control over your users and groups</AlertDescription>
        </Alert>
    </div>;
}

export default function GetStartedPage() {
    return <div className="flex gap-15 justify-center flex-row" style={{height: "calc(100vh - 51px)", width: "100vw"}}>
        <div className=" h-full flex justify-center items-center">
            <TeamGetStartedCard/>
        </div>
        <div className=" h-full flex justify-center items-center">
            <TeamGetStartedInfo/>
        </div>
    </div>;
}