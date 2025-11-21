import { Header, TeamHeader } from "@/components/header";
import { TeamSidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
    title: "Team Dashboard",
    description: "Team Dashboard",
};

export default function TeamLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="page-header-container">
            <TeamHeader title="Team Dashboard" />
            <div className="page-sidebar-split">
                <TeamSidebar />
                {children}
            </div>
            <Toaster position="top-center" />
        </div>
    );
}