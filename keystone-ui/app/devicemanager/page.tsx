"use client";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { useGroupsList, useMDMServersList } from "@/lib/admin";
import { useSession } from "@/lib/auth";
import { CheckIcon, ChevronRightIcon, CogIcon, CrownIcon, GroupIcon, Loader2Icon, PlayIcon, QrCodeIcon, ServerIcon, SettingsIcon, TextIcon, UserIcon, WifiIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ReactQRCode } from '@lglab/react-qr-code'

export default function DeviceManager() {
    const [open, setOpen] = useState(true);
    const [groups, setGroups] = useState<{ id: string, name: string }[]>([]);
    const [wifiNetwork, setWifiNetwork] = useState<{ ssid: string, password: string, security: string } | null>({ ssid: "", password: "", security: "open" });
    const [mdmServer, setMdmServer] = useState<{ id: string, name: string, url: string } | null>(null);
    const [name, setName] = useState<string>("");
    const [enrollmentType, setEnrollmentType] = useState<"userdriven" | "admin" | null>(null);
    const session = useSession();
    useEffect(() => {
        if (session.data?.user?.id && session.loaded) {
            console.log(session.data);
        } else if (session.data?.error && session.loaded) {
            window.location.href = process.env.NEXT_PUBLIC_API_URL + "/auth/signin?redirectTo=" + window.location.href;
        }
    }, [session]);
    return (
        <div>
            <Drawer shouldScaleBackground open={open} onOpenChange={setOpen}>
                <DrawerContent className="h-full flex flex-col p-4">
                    <DrawerHeader>
                        <img src="/devicemanager.svg" alt="Device Manager" className="w-13 h-13" />
                        <DrawerTitle className="text-2xl text-left pt-4">Quntem Device Manager</DrawerTitle>
                        <DrawerDescription className="text-left text-md">Easily provision thetaOS devices</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex-1" />
                    <ItemGroup>
                        <Item className="flex flex-row items-center">
                            <ItemMedia variant={"icon"} className="mt-0.5">
                                <SettingsIcon />
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle>Configure</ItemTitle>
                                <ItemDescription>Create settings for your devices</ItemDescription>
                            </ItemContent>
                        </Item>
                        <Item className="flex flex-row items-center">
                            <ItemMedia variant={"icon"} className="mt-0.5">
                                <QrCodeIcon />
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle>Enroll</ItemTitle>
                                <ItemDescription>Generate QR codes to enroll devices</ItemDescription>
                            </ItemContent>
                        </Item>
                        <Item className="flex flex-row items-center">
                            <ItemMedia variant={"icon"} className="mt-0.5">
                                <ServerIcon />
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle>Manage</ItemTitle>
                                <ItemDescription>Devices get added to an MDM server</ItemDescription>
                            </ItemContent>
                        </Item>
                    </ItemGroup>
                    <div className="flex-1" />
                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button><PlayIcon />Get Started</Button>
                        </DrawerClose>
                    </DrawerFooter>
                    <div className="text-center text-sm text-muted-foreground text-left px-4 pb-4">A Quntem Business account is required to use Device Manager and enroll devices.</div>
                </DrawerContent>
            </Drawer>
            <div className="h-[100dvh] w-screen fixed top-0 p-6 bg-white flex flex-col">
                <CogIcon size={40} className="mb-4" />
                <div className="text-2xl font-medium text-left">Configure Settings</div>
                <div className="text-left text-md text-muted-foreground pt-2">Configure settings for your devices</div>
                <div className="text-left text-md text-muted-foreground pt-2">You are logged in as {session.data?.user?.name}, and are using the {session.data?.user?.tenant?.name} tenant.</div>
                <div className="flex-1" />
                <ItemGroup className="border-1 rounded-md mt-4">
                    <WifiSelectorDrawer wifiNetwork={wifiNetwork} setWifiNetwork={setWifiNetwork}>
                        <Item>
                            <ItemMedia variant={"icon"} className="mt-0.5">
                                <WifiIcon />
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle>Wifi Network</ItemTitle>
                                <ItemDescription>{wifiNetwork?.ssid ? wifiNetwork.ssid : "Select a wifi network"}</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <Button variant={"ghost"} size={"icon"}><ChevronRightIcon /></Button>
                            </ItemActions>
                        </Item>
                    </WifiSelectorDrawer>
                    <Separator />
                    <GroupSelectorDrawer groups={groups} setGroups={setGroups}>
                        <Item>
                            <ItemMedia variant={"icon"} className="mt-0.5">
                                <GroupIcon />
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle>Groups</ItemTitle>
                                <ItemDescription>{groups.length > 0 ? groups.map((g) => g.name).join(", ") : "Select groups to add devices to"}</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <Button variant={"ghost"} size={"icon"}><ChevronRightIcon /></Button>
                            </ItemActions>
                        </Item>
                    </GroupSelectorDrawer>
                    <Separator />
                    <EnrollmentTypeSelectorDrawer enrollmentType={enrollmentType} setEnrollmentType={setEnrollmentType}>
                        <Item>
                            <ItemMedia variant={"icon"} className="mt-0.5">
                                <CrownIcon />
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle>Enrollment Type</ItemTitle>
                                <ItemDescription>{enrollmentType ? enrollmentType === "userdriven" ? "User Driven" : "Admin" : "Select enrollment type"}</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <Button variant={"ghost"} size={"icon"}><ChevronRightIcon /></Button>
                            </ItemActions>
                        </Item>
                    </EnrollmentTypeSelectorDrawer>
                    <Separator />
                    <MDMServerSelectorDrawer mdmServer={mdmServer} setMdmServer={setMdmServer}>
                        <Item>
                            <ItemMedia variant={"icon"} className="mt-0.5">
                                <ServerIcon />
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle>MDM Server</ItemTitle>
                                <ItemDescription>{mdmServer ? mdmServer.name : "Default MDM Server"}</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <Button variant={"ghost"} size={"icon"}><ChevronRightIcon /></Button>
                            </ItemActions>
                        </Item>
                    </MDMServerSelectorDrawer>
                    <Separator />
                    <NameDrawer name={name} setName={setName}>
                        <Item>
                            <ItemMedia variant={"icon"} className="mt-0.5">
                                <TextIcon />
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle>Name</ItemTitle>
                                <ItemDescription>{name ? name : "Select a name"}</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <Button variant={"ghost"} size={"icon"}><ChevronRightIcon /></Button>
                            </ItemActions>
                        </Item>
                    </NameDrawer>
                </ItemGroup>
                <QRcodeDrawer enrollmentType={enrollmentType} wifiNetwork={wifiNetwork} groups={groups} mdmServer={mdmServer} session={session} name={name}>
                    <Button disabled={!name} className="mt-4 w-full"><QrCodeIcon />Generate QR Code</Button>
                </QRcodeDrawer>
            </div>
        </div>
    );
}

function GroupSelectorDrawer({ groups, setGroups, children }: { groups: { id: string, name: string }[], setGroups: (groups: { id: string, name: string }[]) => void, children: React.ReactNode }) {
    const allgroups = useGroupsList()
    return (
        <Drawer>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="text-left">Select Groups</DrawerTitle>
                    <DrawerDescription className="text-left">Select groups to add devices to</DrawerDescription>
                </DrawerHeader>
                <ItemGroup className="border-1 rounded-md mx-4">
                    {allgroups.data?.map((group) => (
                        <div key={group.id}>
                            <Item onClick={() => {
                                if (groups.some((g) => g.id === group.id)) {
                                    setGroups(groups.filter((g) => g.id !== group.id))
                                } else {
                                    setGroups([...groups, group])
                                }
                            }}>
                                <ItemContent>
                                    <ItemTitle>{group.name}</ItemTitle>
                                    <ItemDescription>{group.description}</ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    {groups.some((g) => g.id === group.id) ? <Button variant={"ghost"} size={"icon"}><CheckIcon /></Button> : null}
                                </ItemActions>
                            </Item>
                            {allgroups.data?.[allgroups.data.length - 1]?.id !== group.id && <Separator />}
                        </div>
                    ))}
                </ItemGroup>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button><CheckIcon />Confirm</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

function WifiSelectorDrawer({ wifiNetwork, setWifiNetwork, children }: { wifiNetwork: { ssid: string, password: string, security: string } | null, setWifiNetwork: (wifi: { ssid: string, password: string, security: string } | null) => void, children: React.ReactNode }) {
    return (
        <Drawer>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="text-left">Select Wifi Network</DrawerTitle>
                    <DrawerDescription className="text-left">Select wifi network to add devices to</DrawerDescription>
                </DrawerHeader>
                <FieldGroup className="px-4">
                    <Field>
                        <FieldLabel>Wifi SSID</FieldLabel>
                        <FieldDescription>Enter the SSID of the wifi network</FieldDescription>
                        <Input value={wifiNetwork?.ssid} onChange={(e) => setWifiNetwork({ ...wifiNetwork, ssid: e.target.value })} />
                    </Field>
                    {wifiNetwork?.security !== "open" && <Field>
                        <FieldLabel>Wifi Password</FieldLabel>
                        <FieldDescription>Enter the password of the wifi network</FieldDescription>
                        <Input value={wifiNetwork?.password} onChange={(e) => setWifiNetwork({ ...wifiNetwork, password: e.target.value })} />
                    </Field>}
                    <Field>
                        <FieldLabel>Wifi Security</FieldLabel>
                        <FieldDescription>Select the security type of the wifi network</FieldDescription>
                        <Select onValueChange={(value) => setWifiNetwork({ ...wifiNetwork, security: value })} value={wifiNetwork?.security}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Wifi Security" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="wpa2">WPA2</SelectItem>
                                <SelectItem value="wpa3">WPA3</SelectItem>
                                <SelectItem value="wpa2-wpa3">WPA2/WPA3</SelectItem>
                                <SelectItem value="open">Open</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                </FieldGroup>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button><CheckIcon />Confirm</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

function EnrollmentTypeSelectorDrawer({ enrollmentType, setEnrollmentType, children }: { enrollmentType: string, setEnrollmentType: (enrollmentType: string) => void, children: React.ReactNode }) {
    return (
        <Drawer>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="text-left">Select Enrollment Type</DrawerTitle>
                    <DrawerDescription className="text-left">Select enrollment type</DrawerDescription>
                </DrawerHeader>
                <ItemGroup className="border-1 rounded-md mx-4">
                    <Item onClick={() => setEnrollmentType("userdriven")}>
                        <ItemMedia variant={"icon"} className="mt-0.5">
                            <UserIcon />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>User Driven</ItemTitle>
                            <ItemDescription>User driven enrollment</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            {enrollmentType === "userdriven" && <Button variant={"ghost"} size={"icon"}><CheckIcon /></Button>}
                        </ItemActions>
                    </Item>
                    <Separator />
                    <Item onClick={() => setEnrollmentType("admin")}>
                        <ItemMedia variant={"icon"} className="mt-0.5">
                            <CrownIcon />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>Admin</ItemTitle>
                            <ItemDescription>Admin enrollment</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            {enrollmentType === "admin" && <Button variant={"ghost"} size={"icon"}><CheckIcon /></Button>}
                        </ItemActions>
                    </Item>
                </ItemGroup>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button><CheckIcon />Confirm</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

function MDMServerSelectorDrawer({ mdmServer, setMdmServer, children }: { mdmServer: { id: string, name: string } | null, setMdmServer: (mdmServer: { id: string, name: string } | null) => void, children: React.ReactNode }) {
    const allmdmServers = useMDMServersList()
    return (
        <Drawer>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="text-left">Select MDM Server</DrawerTitle>
                    <DrawerDescription className="text-left">Select MDM server</DrawerDescription>
                </DrawerHeader>
                <ItemGroup className="border-1 rounded-md mx-4">
                    <Item onClick={() => setMdmServer(null)}>
                        <ItemContent>
                            <ItemTitle>Default</ItemTitle>
                            <ItemDescription>Assign default MDM server</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            {mdmServer === null && <Button variant={"ghost"} size={"icon"}><CheckIcon /></Button>}
                        </ItemActions>
                    </Item>
                </ItemGroup>
                <ItemGroup className="border-1 mt-4 rounded-md mx-4">
                    {allmdmServers.data?.map((server) => (
                        <div key={server.id}>
                            <Item key={server.id} onClick={() => {
                                if (server.id === mdmServer?.id) {
                                    setMdmServer(null)
                                } else {
                                    setMdmServer(server)
                                }
                            }}>
                                <ItemContent>
                                    <ItemTitle>{server.name}</ItemTitle>
                                    <ItemDescription>{server.url}</ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    {server.id === mdmServer?.id ? <Button variant={"ghost"} size={"icon"}><CheckIcon /></Button> : null}
                                </ItemActions>
                            </Item>
                            {allmdmServers.data?.[allmdmServers.data.length - 1]?.id !== server.id && <Separator />}
                        </div>
                    ))}
                </ItemGroup>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button><CheckIcon />Confirm</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

function QRcodeDrawer({ children, enrollmentType, wifiNetwork, groups, mdmServer, session, name }: { children: React.ReactNode, enrollmentType: string | null, wifiNetwork: { ssid: string, password: string } | null, groups: { id: string, name: string }[], mdmServer: { id: string, name: string, url: string } | null, session: any, name: string }) {
    return (
        <Drawer>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="text-left">QR Code</DrawerTitle>
                    <DrawerDescription className="text-left">Scan the QR code to enroll your device</DrawerDescription>
                </DrawerHeader>
                <div className="flex justify-center">
                    {session?.data?.session?.id ? <ReactQRCode value={JSON.stringify({
                        "enrollmentType": enrollmentType,
                        "wifiNetwork": wifiNetwork?.ssid ? wifiNetwork : null,
                        "groups": groups.length > 0 ? groups.map((g) => g.id).join(",") : null,
                        "mdmServer": mdmServer?.id ? mdmServer.id : null,
                        "adminToken": session?.data?.session?.id,
                        "name": name.toLowerCase().replaceAll(" ", "-"),
                        "displayName": name
                    })} /> : <div className="flex justify-center"><Loader2Icon className="animate-spin" /></div>}
                </div>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button><CheckIcon />Confirm</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

function NameDrawer({ children, name, setName }: { children: React.ReactNode, name: string, setName: (name: string) => void }) {
    return (
        <Drawer>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="text-left">Name</DrawerTitle>
                    <DrawerDescription className="text-left">Set a name for your device</DrawerDescription>
                </DrawerHeader>
                <div className="px-4"><Input placeholder="Device name" value={name} onChange={(e) => setName(e.target.value)} /></div>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button><CheckIcon />Confirm</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}