import { Header } from "@/components/header";
import { UserSidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";
export const metadata = {
    title: "Your Account",
    description: "Your Account",
};

export default function AccountLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="page-header-container">
            <Header title="Your Account" />
            <div className="page-sidebar-split">
                <UserSidebar />
                {children}
            </div>
            <Toaster position="top-center" />
        </div>
    );
}