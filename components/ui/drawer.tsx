import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const Drawer = DialogPrimitive.Root;
const DrawerTrigger = DialogPrimitive.Trigger;
const DrawerPortal = DialogPrimitive.Portal;
const DrawerOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity",
            className
        )}
        {...props}
    />
));
DrawerOverlay.displayName = "DrawerOverlay";

const DrawerContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
        side?: "left" | "right" | "top" | "bottom";
        showCloseIcon?: boolean;
        onClose?: () => void;
    }
>(
    (
        {
            className,
            children,
            side = "right",
            showCloseIcon = true,
            onClose,
            ...props
        },
        ref
    ) => {
        // Drawer slides in from the side
        const sideClasses = {
            right: "fixed top-0 right-0 h-full w-full max-w-md border-l border-border bg-background shadow-lg z-50 animate-in slide-in-from-right duration-200",
            left: "fixed top-0 left-0 h-full w-full max-w-md border-r border-border bg-background shadow-lg z-50 animate-in slide-in-from-left duration-200",
            top: "fixed top-0 left-0 w-full max-h-[90vh] border-b border-border bg-background shadow-lg z-50 animate-in slide-in-from-top duration-200",
            bottom: "fixed bottom-0 left-0 w-full max-h-[90vh] border-t border-border bg-background shadow-lg z-50 animate-in slide-in-from-bottom duration-200",
        };
        return (
            <DrawerPortal>
                <DrawerOverlay />
                <DialogPrimitive.Content
                    ref={ref}
                    className={cn(sideClasses[side], className)}
                    {...props}
                >
                    {showCloseIcon && (
                        <button
                            aria-label="Close"
                            className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-accent focus:outline-none"
                            onClick={onClose}
                            type="button"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    )}
                    <div className="h-full w-full overflow-y-auto">
                        {children}
                    </div>
                </DialogPrimitive.Content>
            </DrawerPortal>
        );
    }
);
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex flex-col space-y-1.5 px-6 pt-6", className)}
        {...props}
    />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn(
            "text-lg font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    />
));
DrawerTitle.displayName = "DrawerTitle";

const DrawerDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
));
DrawerDescription.displayName = "DrawerDescription";

export {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
};
