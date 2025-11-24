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
    const [name, setName] = useState("");
    const emailExists = useEmailExists(email);
    return <div className="get-started-page">
        <div style={{ textAlign: "center", fontFamily: "Figtree", color: "var(--qu-text)", marginBottom: "25px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <img src="/account_text.svg" style={{ height: "30px", width: "auto", marginBottom: "25px" }} alt="" />
            <h1 className="text-3xl font-medium mb-2">One account, infinite possibilities</h1>
            <p className="text-lg">Your Quntem Account is your gateway to all Quntem services</p>
        </div>
        {emailExists && <Alert variant="destructive" style={{ width: "400px", marginBottom: "25px" }}>
            <TriangleAlertIcon />
            <AlertTitle>Email already exists</AlertTitle>
            <AlertDescription>Please choose a different email</AlertDescription>
        </Alert>}
        {!isEmail(email) && <Alert variant="destructive" style={{ width: "400px", marginBottom: "25px" }}>
            <TriangleAlertIcon />
            <AlertTitle>Invalid email</AlertTitle>
            <AlertDescription>Please enter a valid email</AlertDescription>
        </Alert>}
        <Card style={{ width: "400px" }}>
            {/* <CardHeader>
                <CardTitle>Quntem KeyStone</CardTitle>
                <CardDescription>Get Started with Quntem KeyStone for free</CardDescription>
            </CardHeader> */}
            <div>
                <InputField style={{ padding: "0px 25px 25px 25px" }} label="Name" value={name} setValue={setName} />
                <InputField style={{ padding: "0px 25px 25px 25px" }} label="Email" value={email} setValue={setEmail} />
                <InputField type="password" autoComplete="new-password" style={{ padding: "0px 25px 25px 25px" }} label="Password" value={password} setValue={setPassword} />
            </div>
            <CardFooter style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button disabled={!name || !email || !password || !isEmail(email) || emailExists} onClick={() => {
                    fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/setuppersonal", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                        },
                        body: JSON.stringify({ email, password, name })
                    }).then(res => {
                        return res.json();
                    }).then(async data => {
                        window.location.href = "/account";
                    });
                }}><KeyRoundIcon size={20} /> Get Started</Button>
            </CardFooter>
        </Card>
    </div>;
}