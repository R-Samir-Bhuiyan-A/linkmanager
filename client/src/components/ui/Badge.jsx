import { cn } from "../../lib/utils"

export function Badge({ className, variant = "default", children, ...props }) {
    const variants = {
        default: "bg-surface hover:bg-surfaceHover border-border text-text",
        success: "bg-success/20 text-success border-success/30",
        warning: "bg-warning/20 text-warning border-warning/30",
        danger: "bg-danger/20 text-danger border-danger/30",
        primary: "bg-primary/20 text-primary border-primary/30",
    }

    return (
        <span className={cn("badge transition-colors", variants[variant], className)} {...props}>
            {children}
        </span>
    )
}
