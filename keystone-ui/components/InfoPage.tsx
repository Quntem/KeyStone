import { Building2Icon, KeyRoundIcon, LogInIcon, SparklesIcon, UserIcon, UsersIcon } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

export function InfoBanner() {
    return <div className="info-banner">
        <div className="info-banner-inner">
            <div className="info-banner-left">
                <KeyRoundIcon size={40} />
                <div className="info-banner-title">Quntem KeyStone</div>
                <div className="info-banner-subtitle">Secure access to your internal tools and applications</div>
                <div className="info-banner-buttonrow">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" style={{ color: "var(--qu-text)" }}><SparklesIcon size={20} />Get Started</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuGroup title="KeyStone">
                                <DropdownMenuLabel>KeyStone</DropdownMenuLabel>
                                <Link href="/get-started"><DropdownMenuItem><Building2Icon />For Business</DropdownMenuItem></Link>
                                <Link href="/get-started/team"><DropdownMenuItem><UsersIcon />For Teams</DropdownMenuItem></Link>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup title="Account">
                                <DropdownMenuLabel>Account</DropdownMenuLabel>
                                <Link href="/get-started/personal"><DropdownMenuItem><UserIcon />For Individuals</DropdownMenuItem></Link>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Link href="/account"><Button variant="outline" style={{ color: "var(--qu-text)" }}><LogInIcon size={20} />Access My Account</Button></Link>
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