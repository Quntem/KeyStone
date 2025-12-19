"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircleIcon, UserIcon, UsersIcon } from "lucide-react"

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

export function TeamSwitcher() {
    const { auth, team, setTeam } = React.useContext(authContext);
    const [open, setOpen] = React.useState(false)

    return (
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
                        <CommandGroup heading="Teams">
                            {auth?.data?.user?.groups?.map((group) => (
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
                        </CommandGroup>
                        <CommandSeparator alwaysRender />
                        <CommandGroup>
                            <CommandItem>
                                <PlusCircleIcon />
                                Create Team
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
