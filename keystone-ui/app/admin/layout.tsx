import { Header } from "@/components/header";
import { AdminSidebar } from "@/components/sidebar";

export const metadata = {
    title: "KeyStone Admin Center",
    description: "KeyStone Admin Center",
};

export default function AdminLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="page-header-container">
            <Header title="KeyStone Admin Center" />
            <div className="page-sidebar-split">
                <AdminSidebar />
                {children}
            </div>
        </div>
    );
}