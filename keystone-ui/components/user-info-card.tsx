"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type UserInfoCardProps = {
  username: string;
  displayName: string;
  tenant: string;
  role: string;
  email: string;
  title?: string;
  className?: string;
};

export function UserInfoCard({
  username,
  displayName,
  tenant,
  role,
  email,
  title = "User Info",
  className,
}: UserInfoCardProps) {
  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-start gap-4">
      <span className="text-sm text-muted-foreground whitespace-nowrap">{label}</span>
      <span className="text-sm font-medium break-all text-right">{value}</span>
    </div>
  );

  return (
    <Card className={cn("py-4 px-6", className)}>
      <CardHeader className="px-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>
          Some information can only be changed by an admin
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid gap-3">
          <Row label="Username" value={username} />
          <Row label="Display name" value={displayName} />
          {tenant ? <Row label="Tenant" value={tenant} /> : null}
          <Row label="Role" value={role} />
          <Row label="Email" value={email} />
        </div>
      </CardContent>
    </Card>
  );
}
