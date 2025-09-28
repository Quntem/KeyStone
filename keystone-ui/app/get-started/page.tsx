"use client"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRoundIcon, TriangleAlertIcon } from "lucide-react";
import { InputField, PrefixedInput, SuffixedInput } from "@/components/userstable";
import { useEffect, useState } from "react";
import { useEmailExists, useDomainExists, useTenantExists } from "@/lib/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import isEmail from "is-email";
import { createDomain } from "@/lib/admin";

export default function GetStartedPage() {
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
    const [domain, setDomain] = useState("");
    const domainExists = useDomainExists(domain);
    const emailExists = useEmailExists(email + "@" + domain);
    return <div className="get-started-page">
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
        {!isEmail(email + "@" + domain) && <Alert variant="destructive" style={{width: "500px", marginBottom: "25px"}}>
            <TriangleAlertIcon/>
            <AlertTitle>Invalid email</AlertTitle>
            <AlertDescription>Please enter a valid email</AlertDescription>
        </Alert>}
        {domainExists && <Alert variant="destructive" style={{width: "500px", marginBottom: "25px"}}>
            <TriangleAlertIcon/>
            <AlertTitle>Domain already exists</AlertTitle>
            <AlertDescription>Please choose a different domain</AlertDescription>
        </Alert>}
        <Card style={{width: "500px"}}>
            <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>Get Started with Quntem KeyStone for free</CardDescription>
            </CardHeader>
            <div>
                <InputField style={{padding: "0px 25px 25px 25px"}} label="Tenant Name" value={tenantName} setValue={setTenantName}/>
                <PrefixedInput style={{padding: "0px 25px 25px 25px"}} label="Username" value={username} setValue={setUsername} prefix={tenantName + "/"}/>
                <InputField style={{padding: "0px 25px 25px 25px"}} label="Domain" value={domain} setValue={setDomain}/>
                {/* <InputField autoComplete="new-password" style={{padding: "0px 25px 25px 25px"}} label="Email" value={email} setValue={setEmail}/> */}
                <SuffixedInput style={{padding: "0px 25px 25px 25px"}} label="Email" value={email} setValue={setEmail} suffix={"@" + domain}/>
                <InputField type="password" autoComplete="new-password" style={{padding: "0px 25px 25px 25px"}} label="Password" value={password} setValue={setPassword}/>
                <InputField style={{padding: "0px 25px 25px 25px"}} label="Name" value={name} setValue={setName}/>
            </div>
            <CardFooter style={{display: "flex", justifyContent: "flex-end"}}>
                <Button disabled={tenantExists || !tenantName || !username || !email || !password || !isEmail(email + "@" + domain) || domainExists} onClick={() => {
                    fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/setuptenant", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                        },
                        body: JSON.stringify({tenantName, username, email: email + "@" + domain, password, name, domain})
                    }).then(res => {
                        return res.json();
                    }).then(async data => {
                        window.location.href = "/admin";
                    });
                }}><KeyRoundIcon size={20}/> Get Started</Button>
            </CardFooter>
        </Card>
    </div>;
}