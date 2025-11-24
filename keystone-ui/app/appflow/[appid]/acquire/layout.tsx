import { GetStartedHeader } from "@/components/header";

export const metadata = {
    title: "Login",
    description: "Login to your app",
}

export default function GetStartedLayout({children}: {children: React.ReactNode}) {
    return <div>
        <GetStartedHeader />
        {children}
    </div>;
}