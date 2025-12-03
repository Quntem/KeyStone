"use client"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePublicApp } from "@/lib/auth";
import { LogInIcon, PlusIcon } from "lucide-react";
import { useSession } from "@/lib/auth";
import { useEffect } from "react";
import { useTenant } from "@/lib/auth";

export default function GetStartedPage({ params }: { params: { appid: string } }) {
    const session = useSession();
    const tenant = useTenant();
    useEffect(() => {
        if (session.data?.error) {
            window.location.href = process.env.NEXT_PUBLIC_API_URL + "/auth/signin?redirectTo=" + window.location.href;
        }
    }, [session]);
    const publicApp = usePublicApp(params.appid);
    // if (session.data?.user?.role != "ADMIN") {
    //     return <Card style={{width: "500px"}}>
    //         <CardHeader>
    //             <CardTitle style={{color: "var(--qu-text)"}}>Unauthorized</CardTitle>
    //             <CardDescription style={{color: "var(--qu-text-secondary)"}}>You do not have permission to add an app to your tenant</CardDescription>
    //         </CardHeader>
    //     </Card>;
    // }
    return <div className="get-started-page" style={{ gap: "20px" }}>
        {/* <img src={publicApp.data?.tenant?.logo} className="header-logo" /> */}
        <Card style={{ width: "500px" }}>
            <CardHeader>
                <CardTitle style={{ color: "var(--qu-text)" }}>Sign In With Quntem</CardTitle>
                <CardDescription style={{ color: "var(--qu-text-secondary)" }}>Sign in to {publicApp.data?.app?.name} with your Quntem Account</CardDescription>
            </CardHeader>
            <div className="acquire-app-info">
                <img src={publicApp.data?.app?.logo} className="header-logo" />
                <div className="acquire-app-info-text">
                    <div className="acquire-app-info-text-title">{publicApp.data?.app?.name}</div>
                    <div className="acquire-app-info-text-published">Published By {publicApp.data?.tenant?.displayName ? publicApp.data?.tenant?.displayName : publicApp.data?.tenant?.name}</div>
                </div>
            </div>
            <CardFooter>
                <div style={{ flex: 1 }} />
                <Button variant="outline" style={{ color: "var(--qu-text)" }} onClick={() => {
                    fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/personal/acquireapp/" + params.appid, {
                        method: "POST",
                        credentials: "include",
                        redirect: "manual",
                        headers: {
                            "Content-Type": "application/json",
                        }
                    }).then((res) => {
                        const searchParams = new URLSearchParams(window.location.search);
                        window.location.href = searchParams.get("redirect") || "/account";
                    });
                }}><LogInIcon />Sign In</Button>
            </CardFooter>
        </Card>
    </div>;
}