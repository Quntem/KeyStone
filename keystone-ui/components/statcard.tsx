"use client"
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatCardProps = {
  title: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function StatCard({ title, value, icon, className, onClick }: StatCardProps) {
  return (
    <Card className={cn("py-4 px-6", className)} onClick={onClick}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">{title}</span>
            <span className="text-3xl font-semibold leading-tight mt-1">{value}</span>
          </div>
          {icon && (
            <div className="rounded-md border bg-accent text-accent-foreground size-10 grid place-items-center shadow-xs">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {children}
    </div>
  );
}
