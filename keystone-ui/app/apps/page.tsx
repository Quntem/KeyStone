"use client"
import { UseUserAppAccess } from "@/lib/auth";
import { useEffect } from "react";


export default function AccountLayout() {
    const appsListHook = UseUserAppAccess();
    useEffect(() => {
        console.log(appsListHook);
    }, [appsListHook]);
    return (
        <div className="flex flex-wrap gap-2">
            {appsListHook.loaded && appsListHook.data && appsListHook.data?.map((app: any) => (
                <AppItem key={app.id} app={app.app} />
            ))}
        </div>
    );
}

function AppItem({app}: {app: any}) {
    return (
        <div className="app-page-item" onClick={() => {
            open(app.mainUrl, "_blank");
        }}>
            <img src={app.logo} className="app-page-item-logo" />
            <div className="app-page-item-title">{app.name}</div>
            <div className="app-page-item-subtitle">{app.description}</div>
        </div>
    );
}