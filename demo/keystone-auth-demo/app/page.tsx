"use client";
import { useAuth } from "@/lib/keystone";
import { useEffect } from "react";

export default function Home() {
  const auth = useAuth({appId: process.env.NEXT_PUBLIC_KEYSTONE_APPID as string, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL as string});
  useEffect(() => {
    console.log(auth);
  }, [auth]);
  if (!auth.data?.user) {
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
      <div>Welcome {auth?.data?.user?.name}</div>
      <div>Email: {auth?.data?.user?.email}</div>
      <div>Username: {auth?.data?.user?.username}</div>
      <div>You are a {auth?.data?.user?.role} in {auth?.data?.user?.tenant?.name}</div>
      <div>Tenant Logo: <img src={auth?.data?.user?.tenant?.logo} alt="Tenant Logo" /></div>
      <div>Groups: {auth?.data?.user?.groups?.map((group) => group.group.name).join(", ")}</div>
      <div>Your session started at {new Date(auth?.data?.createdAt).toLocaleString()}</div>
      <div>You are using the app {auth?.data?.app?.name}</div>
      <div>App Logo: <img src={auth?.data?.app?.logo} alt="App Logo" /></div>
      <div>App Description: {auth?.data?.app?.description}</div>
      <div>App URL: {auth?.data?.app?.mainUrl}</div>
      {/* <div>{JSON.stringify(auth)}</div> */}
      <button onClick={() => {
        fetch("/api", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + auth?.data?.sessionId,
          },
        }).then((res) => res.json()).then((res) => {
          console.log(res);
        });
      }}>Test Request</button>
    </div>
  );
}
