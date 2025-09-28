import { Header } from "@/components/header";

export const metadata = {
    title: "Your Apps",
    description: "Your Apps",
};

export default function Layout({ children }: { children: React.ReactNode }) {
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
                {children}
            </div>
        </div>
    );
}