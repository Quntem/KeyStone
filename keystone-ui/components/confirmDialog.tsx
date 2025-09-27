"use client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "./ui/button"
import { DialogFooter } from "./ui/dialog"
import { CheckIcon, XIcon } from "lucide-react";

export function ConfirmDialog({
    title,
    description,
    isOpen,
    onConfirm,
    onClose,
}: {
    title: string;
    description: string;
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={onConfirm}><CheckIcon size={20} />Confirm</Button>
                    <Button variant="outline" onClick={onClose}><XIcon size={20} />Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}