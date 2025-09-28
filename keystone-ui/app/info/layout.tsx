import { InfoHeader } from "@/components/header";

export default function InfoLayout({children}: {children: React.ReactNode}) {
    return <div>
        <InfoHeader />
        {children}
    </div>;
}