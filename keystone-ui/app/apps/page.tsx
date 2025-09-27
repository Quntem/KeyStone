import { Header } from "@/components/header";
import { UserSidebar } from "@/components/sidebar";
export const metadata = {
    title: "Your Apps",
    description: "Your Apps",
};

export default function AccountLayout() {
    return (
        <div className="page-header-container">
            <Header title="Your Apps" />
            <div className="admin-page">
                <div className="admin-page-header">
                    <div>
                        <div className="admin-page-title">Your Apps</div>
                        <div className="admin-page-subtitle">Easily access apps you have access to</div>
                    </div>
                </div>
            </div>
        </div>
    );
}