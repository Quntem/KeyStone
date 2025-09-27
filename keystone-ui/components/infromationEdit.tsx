import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { SaveIcon, XIcon } from "lucide-react";
import { Input } from "./ui/input";
import { useState } from "react";
import { setTenantDescription, setTenantLogo } from "@/lib/admin";
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
