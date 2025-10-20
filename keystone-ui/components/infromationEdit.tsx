import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { SaveIcon, XIcon } from "lucide-react";
import { Input } from "./ui/input";
import { useState } from "react";
import { setTenantDescription, setTenantDisplayName, setTenantLogo } from "@/lib/admin";
import { setDisplayName, setPassword } from "@/lib/auth";
import { toast } from "sonner";
export function SetLogo({defaultLogo}: {defaultLogo: string}) {
    const [originalLogo, setOriginalLogo] = useState(defaultLogo);
    const [logo, setLogo] = useState(defaultLogo);
    return <Card>
        <CardHeader>
            <CardTitle>Set Logo</CardTitle>
            <CardDescription>Set the logo for your tenant</CardDescription>
        </CardHeader>
        <CardContent>
            <Input placeholder="Logo URL" value={logo} onChange={(e) => setLogo(e.target.value)} type="url" />
        </CardContent>
        <CardFooter style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: "10px"}}>
            <Button variant="outline" disabled={logo === originalLogo} onClick={() => {setTenantLogo(logo).then(() => {setOriginalLogo(logo)});}}><SaveIcon size={20} />Save</Button>
            <Button variant="outline" onClick={() => setLogo("")}><XIcon size={20} />Remove</Button>
        </CardFooter>
    </Card>
}

export function SetName({defaultName}: {defaultName: string}) {
    const [originalName, setOriginalName] = useState(defaultName);
    const [name, setName] = useState(defaultName);
    return <Card>
        <CardHeader>
            <CardTitle>Set Name</CardTitle>
            <CardDescription>Set the name for your tenant</CardDescription>
        </CardHeader>
        <CardContent>
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        </CardContent>
        <CardFooter style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: "10px"}}>
            <Button variant="outline" disabled={name === originalName}><SaveIcon size={20} />Save</Button>
            <Button variant="outline"><XIcon size={20} />Remove</Button>
        </CardFooter>
    </Card>
}

export function SetDisplayName({defaultDisplayName}: {defaultDisplayName: string}) {
    const [originalDisplayName, setOriginalDisplayName] = useState(defaultDisplayName);
    const [displayName, setDisplayName] = useState(defaultDisplayName);
    return <Card>
        <CardHeader>
            <CardTitle>Set Display Name</CardTitle>
            <CardDescription>Set the display name for your tenant</CardDescription>
        </CardHeader>
        <CardContent>
            <Input placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </CardContent>
        <CardFooter style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: "10px"}}>
            <Button variant="outline" disabled={displayName === originalDisplayName} onClick={() => {setTenantDisplayName(displayName).then(() => {setOriginalDisplayName(displayName)});}}><SaveIcon size={20} />Save</Button>
            <Button variant="outline" onClick={() => setDisplayName("")}><XIcon size={20} />Remove</Button>
        </CardFooter>
    </Card>
}

export function SetDescription({defaultDescription}: {defaultDescription: string}) {
    const [originalDescription, setOriginalDescription] = useState(defaultDescription);
    const [description, setDescription] = useState(defaultDescription);
    return <Card>
        <CardHeader>
            <CardTitle>Set Description</CardTitle>
            <CardDescription>Set the description for your tenant</CardDescription>
        </CardHeader>
        <CardContent>
            <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </CardContent>
        <CardFooter style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: "10px"}}>
            <Button variant="outline" disabled={description === originalDescription} onClick={() => {setTenantDescription(description).then(() => {setOriginalDescription(description)});}}><SaveIcon size={20} />Save</Button>
            <Button variant="outline" onClick={() => setDescription("")}><XIcon size={20} />Remove</Button>
        </CardFooter>
    </Card>
}

export function SetPassword() {
    const [editedPassword, setEditedPasword] = useState("");
    return <Card>
        <CardHeader>
            <CardTitle>Set Password</CardTitle>
            <CardDescription>Set the password for your user</CardDescription>
        </CardHeader>
        <CardContent>
            <Input type="password" placeholder="Password" value={editedPassword} onChange={(e) => setEditedPasword(e.target.value)} />
        </CardContent>
        <CardFooter style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: "10px"}}>
            <Button variant="outline" onClick={() => {
                setPassword(editedPassword).then((data) => {
                    if (!data.error) {
                        setEditedPasword("");
                        toast("Password set successfully", {
                            description: "Your password has been set successfully",
                        })
                    }
                })
            }}><SaveIcon size={20} />Save</Button>
        </CardFooter>
    </Card>
}