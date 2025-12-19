"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircleIcon, PlusIcon, UserIcon, UsersIcon, XCircleIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { authContext } from "@/app/app/layout"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { useState } from "react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group"
import { Input } from "./ui/input"

export function TeamSwitcher() {
    const { auth, team, setTeam } = React.useContext(authContext);
    const [open, setOpen] = React.useState(false)
    const [createOpen, setCreateOpen] = React.useState(false)

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[200px]"
                    >
                        {team?.group.type === "personal" ? <UserIcon /> : <UsersIcon />}
                        {team
                            ? team.group.name
                            : "Select a team..."}
                        <ChevronsUpDown className="opacity-50 ml-auto" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput placeholder="Search teams..." className="h-9" />
                        <CommandList>
                            <CommandEmpty>No team found.</CommandEmpty>
                            <CommandGroup heading="Personal Account">
                                <CommandItem
                                    key={auth?.data?.user?.id}
                                    value={auth?.data?.user?.id}
                                    onSelect={(currentValue) => {
                                        setTeam({
                                            id: auth?.data?.user?.id,
                                            group: {
                                                id: auth?.data?.user?.id,
                                                name: auth?.data?.user?.name,
                                                type: "personal"
                                            }
                                        })
                                        setOpen(false)
                                    }}
                                >
                                    <UserIcon />
                                    {auth?.data?.user?.name}
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            team?.id === auth?.data?.user?.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            </CommandGroup>
                            {auth?.data?.user?.groups?.filter((group) => group.group.type === "Functional").length > 0 && <CommandGroup heading="Teams">
                                {auth?.data?.user?.groups?.filter((group) => group.group.type === "Functional").map((group) => (
                                    <CommandItem
                                        key={group.group.id}
                                        value={group.group.id}
                                        onSelect={(currentValue) => {
                                            setTeam(group)
                                            setOpen(false)
                                        }}
                                    >
                                        <UsersIcon />
                                        {group.group.name}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                team?.group.id === group.group.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>}
                            {auth?.data?.user?.tenant?.allowGroupCreation && <>
                                <CommandSeparator alwaysRender />
                                <CommandGroup>
                                    <CommandItem onSelect={() => setCreateOpen(true)}>
                                        <PlusCircleIcon />
                                        Create Team
                                    </CommandItem>
                                </CommandGroup>
                            </>}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <CreateTeamModal open={createOpen} onOpenChange={setCreateOpen} />
        </>
    )
}

export function CreateTeamModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const { auth, setKeystoneUrl } = React.useContext(authContext);
    const [name, setName] = useState("");
    const [groupname, setGroupname] = useState("");
    const [description, setDescription] = useState("");
    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create Team</DialogTitle>
                <DialogDescription>
                    Create a new team
                </DialogDescription>
            </DialogHeader>
            <InputGroup>
                <InputGroupAddon>Name:</InputGroupAddon>
                <InputGroupInput value={name} onChange={(e) => setName(e.target.value)} />
            </InputGroup>
            <InputGroup>
                <InputGroupAddon>Groupname:</InputGroupAddon>
                <InputGroupAddon>{auth?.data?.user?.tenant?.name}/</InputGroupAddon>
                <InputGroupInput style={{ paddingLeft: 0 }} value={groupname} onChange={(e) => setGroupname(e.target.value)} />
            </InputGroup>
            <InputGroup>
                <InputGroupAddon>Description:</InputGroupAddon>
                <InputGroupInput value={description} onChange={(e) => setDescription(e.target.value)} />
            </InputGroup>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline"><XIcon />Cancel</Button>
                </DialogClose>
                <Button onClick={() => {
                    fetch(process.env.NEXT_PUBLIC_KEYSTONE_URL + "/app/createGroup", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "accept": "application/json",
                            "x-app-id": process.env.NEXT_PUBLIC_KEYSTONE_APPID,
                        },
                        credentials: "include",
                        redirect: "manual",
                        body: JSON.stringify({
                            name: name,
                            groupname: groupname,
                            description: description,
                        })
                    }).then((res) => res.json()).then((data) => {
                        onOpenChange(false);
                        setName("");
                        setGroupname("");
                        setDescription("");
                        auth?.reload()
                    })
                }}><PlusIcon />Create</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}