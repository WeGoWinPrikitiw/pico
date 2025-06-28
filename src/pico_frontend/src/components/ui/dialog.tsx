import React, { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
}

interface DialogContentProps {
    children: ReactNode;
    className?: string;
}

interface DialogHeaderProps {
    children: ReactNode;
}

interface DialogTitleProps {
    children: ReactNode;
    className?: string;
}

interface DialogTriggerProps {
    children: ReactNode;
    asChild?: boolean;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50"
                onClick={() => onOpenChange(false)}
            />
            {children}
        </div>
    );
}

export function DialogContent({ children, className = "" }: DialogContentProps) {
    return (
        <div className={`relative bg-background border border-border rounded-lg shadow-lg max-w-lg w-full max-h-[85vh] overflow-y-auto mx-4 ${className}`}>
            {children}
        </div>
    );
}

export function DialogHeader({ children }: DialogHeaderProps) {
    return (
        <div className="flex flex-col space-y-1.5 p-6 pb-4">
            {children}
        </div>
    );
}

export function DialogTitle({ children, className = "" }: DialogTitleProps) {
    return (
        <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
            {children}
        </h2>
    );
}

export function DialogTrigger({ children }: DialogTriggerProps) {
    return <>{children}</>;
}

export function DialogClose({ children }: { children: ReactNode }) {
    return <>{children}</>;
} 