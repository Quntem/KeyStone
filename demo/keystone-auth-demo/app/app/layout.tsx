"use client";
import { AuthState, Group, useAuth } from "keystone-lib";
import { createContext, useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamSwitcher } from "@/components/teamswitcher";

export const authContext = createContext({
    auth: null as AuthState | null,
    team: null as Group | null,
    setTeam: null as ((team: Group) => void) | null,
    keystoneUrl: null as string | null,
    setKeystoneUrl: null as ((url: string) => void) | null,
});

export default function Layout({ children }: { children: React.ReactNode }) {
    const [team, setTeam] = useState(null as Group | null);
    useEffect(() => {
        if (!window.localStorage) return;
        const team = window.localStorage.getItem("team");
        if (team) {
            setTeam(JSON.parse(team));
        }
    }, []);
    useEffect(() => {
        if (!window.localStorage) return;
        window.localStorage.setItem("team", JSON.stringify(team));
    }, [team]);
    const [keystoneUrl, setKeystoneUrl] = useState(process.env.NEXT_PUBLIC_KEYSTONE_URL as string);
    const auth = useAuth({ appId: process.env.NEXT_PUBLIC_KEYSTONE_APPID as string, keystoneUrl: keystoneUrl });
    return <authContext.Provider value={{ auth, team, setTeam, keystoneUrl, setKeystoneUrl }}><div className="w-screen h-screen fixed flex flex-col">
        <div className="px-2 h-[55px] max-h-[55px] min-h-[55px] border-b-1 flex flex-row items-center w-full">
            <TeamSwitcher />
        </div>
        <div className="flex-1 max-h-[calc(100vh-55px)] overflow-y-auto">
            {children}
        </div>
    </div></authContext.Provider>;
}