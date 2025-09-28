import { GetStartedHeader } from "@/components/header";

export const metadata = {
    title: "Get Started",
    description: "Get Started with Quntem KeyStone for free",
}

export default function GetStartedLayout({children}: {children: React.ReactNode}) {
    return <div>
        <GetStartedHeader />
        {children}
    </div>;
}