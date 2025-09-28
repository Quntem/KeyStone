import { KeyRoundIcon, LogInIcon, SparklesIcon } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

export function InfoBanner() {
    return <div className="info-banner">
        <div className="info-banner-inner">
            <div className="info-banner-left">
                <KeyRoundIcon size={40}/>
                <div className="info-banner-title">Quntem KeyStone</div>
                <div className="info-banner-subtitle">Secure access to your internal tools and applications</div>
                <div className="info-banner-buttonrow">
                    <Link href="/get-started"><Button variant="outline" style={{color: "var(--qu-text)"}}><SparklesIcon size={20}/>Get Started</Button></Link>
                    <Link href="/account"><Button variant="outline" style={{color: "var(--qu-text)"}}><LogInIcon size={20}/>Access My Account</Button></Link>
                </div>
            </div>
        </div>
    </div>;
}

export function InfoContent() {
    return <div className="info-content">
        <div className="info-content-inner">
            <div className="info-content-left">
                <div className="info-content-title">What is Quntem KeyStone?</div>
                <div className="info-content-subtitle">Quntem KeyStone is a powerful and flexible authentication system for internal applications. It allows you to authenticate users and manage their access to your applications. You can easily integrate it into your applications and allow your employees and contractors to access your internal tools.</div>
            </div>
        </div>
    </div>;
}