"use client";
import { useAuth } from "@/lib/keystone";
import { useEffect } from "react";

export default function Home() {
  const auth = useAuth({appId: process.env.NEXT_PUBLIC_KEYSTONE_APPID as string, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL as string});
  useEffect(() => {
    console.log(auth);
  }, [auth]);
  if (!auth.user?.userAppAccess) {
    return (
      <div>
        <h1 className="text-3xl font-bold underline">FAIL!</h1>
        <div>Either there is no session, or the current user cannot access the app</div>
      </div>
    )
  }
  return (
    <div>
      <h1 className="text-3xl font-bold underline">SUCCESS!</h1>
      <div>If you see this, it means that the authentication was successful</div>
      <div>Welcome {auth?.user?.userAppAccess?.user?.name}</div>
      <div>Email: {auth?.user?.userAppAccess?.user?.email}</div>
      <div>Username: {auth?.user?.userAppAccess?.user?.username}</div>
      <div>You are a {auth?.user?.userAppAccess?.user?.role} in {auth?.user?.userAppAccess?.user?.tenant?.name}</div>
      <div>Tenant Logo: <img src={auth?.user?.userAppAccess?.user?.tenant?.logo} alt="Tenant Logo" /></div>
      <div>Groups: {auth?.user?.userAppAccess?.user?.groups?.map((group) => group.group.name).join(", ")}</div>
      <div>Your session started at {new Date(auth?.user?.createdAt).toLocaleString()}</div>
      <div>You are using the app {auth?.user?.userAppAccess?.app?.name}</div>
      <div>App Logo: <img src={auth?.user?.userAppAccess?.app?.logo} alt="App Logo" /></div>
      <div>App Description: {auth?.user?.userAppAccess?.app?.description}</div>
      <div>App URL: {auth?.user?.userAppAccess?.app?.mainUrl}</div>
      {/* <div>{JSON.stringify(auth)}</div> */}
    </div>
  );
}
