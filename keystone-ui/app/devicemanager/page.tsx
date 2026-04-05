"use client";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { ChevronRightIcon, CogIcon, CrownIcon, GroupIcon, PlayIcon, QrCodeIcon, ServerIcon, SettingsIcon, WifiIcon } from "lucide-react";
import { useState } from "react";

export default function DeviceManager() {
    const [open, setOpen] = useState(true);
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
                <div className="flex-1" />
                <ItemGroup className="border-1 rounded-md mt-4">
                    <Item>
                        <ItemMedia variant={"icon"} className="mt-0.5">
                            <WifiIcon />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>Wifi Network</ItemTitle>
                            <ItemDescription>Select a wifi network</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Button variant={"ghost"} size={"icon"}><ChevronRightIcon /></Button>
                        </ItemActions>
                    </Item>
                    <Separator />
                    <Item>
                        <ItemMedia variant={"icon"} className="mt-0.5">
                            <GroupIcon />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>Groups</ItemTitle>
                            <ItemDescription>Select groups to add devices to</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Button variant={"ghost"} size={"icon"}><ChevronRightIcon /></Button>
                        </ItemActions>
                    </Item>
                    <Separator />
                    <Item>
                        <ItemMedia variant={"icon"} className="mt-0.5">
                            <CrownIcon />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>Enrollment Type</ItemTitle>
                            <ItemDescription>Select enrollment type</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Button variant={"ghost"} size={"icon"}><ChevronRightIcon /></Button>
                        </ItemActions>
                    </Item>
                    <Separator />
                    <Item>
                        <ItemMedia variant={"icon"} className="mt-0.5">
                            <ServerIcon />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>MDM Server</ItemTitle>
                            <ItemDescription>Select MDM server</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Button variant={"ghost"} size={"icon"}><ChevronRightIcon /></Button>
                        </ItemActions>
                    </Item>
                </ItemGroup>
                <Button className="mt-4 w-full"><QrCodeIcon />Generate QR Code</Button>
            </div>
        </div>
    );
}