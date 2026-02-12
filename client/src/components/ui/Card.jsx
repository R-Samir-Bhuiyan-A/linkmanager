import { cn } from "../../lib/utils"

export function Card({ className, children, ...props }) {
    return (
        <div className={cn("card", className)} {...props}>
            {children}
        </div>
    )
}

export function CardHeader({ className, children, ...props }) {
    return (
        <div className={cn("mb-4 flex flex-col space-y-1.5", className)} {...props}>
            {children}
        </div>
    )
}

export function CardTitle({ className, children, ...props }) {
    return (
        <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props}>
            {children}
        </h3>
    )
}

export function CardContent({ className, children, ...props }) {
    return (
        <div className={cn("", className)} {...props}>
            {children}
        </div>
    )
}
