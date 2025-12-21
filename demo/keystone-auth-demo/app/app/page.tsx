"use client";
import { useAuth } from "@/lib/keystone";
import { useEffect } from "react";

export default function Home() {
  const auth = useAuth({ appId: process.env.NEXT_PUBLIC_KEYSTONE_APPID as string, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL as string });
  useEffect(() => {
    console.log(auth);
  }, [auth]);
  if (!auth.loaded) {
    return (
      <div>
        <h1 className="text-3xl font-bold underline">Loading...</h1>
      </div>
    )
  }
  if (!auth.data?.user) {
    return (
      <div>
        <h1 className="text-3xl font-bold underline">FAIL!</h1>
        <div>Either there is no session, or the current user cannot access the app</div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-4 w-screen h-[calc(100dvh-55px)]">

    </div>
  );
}
