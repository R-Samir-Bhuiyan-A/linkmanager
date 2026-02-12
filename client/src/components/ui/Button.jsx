import { cn } from "../../lib/utils"
// Ensure you have lucide-react installed for icons if passed as children or props
import { Loader2 } from "lucide-react"

export function Button({
    className,
    variant = "primary",
    size = "default",
    isLoading = false,
    children,
    ...props
}) {
    const variants = {
        primary: "btn-primary",
        secondary: "btn-secondary",
        danger: "btn-danger",
        ghost: "hover:bg-surfaceHover text-textMuted hover:text-text",
    }

    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-sm",
        lg: "h-12 px-8 text-lg",
        icon: "h-10 w-10 p-0",
    }

    return (
        <button
            className={cn("btn", variants[variant], sizes[size], className)}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    )
}
