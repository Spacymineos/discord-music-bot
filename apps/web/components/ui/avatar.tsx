'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string | null
    alt?: string
    fallback?: string
}

export const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
                className
            )}
            {...props}
        />
    )
)
Avatar.displayName = "Avatar"

export const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement> & { src?: string | null }>(
    ({ className, src, alt, ...props }, ref) => {
        if (!src) return null
        return (
            <Image
                src={src}
                alt={alt || "Avatar"}
                fill
                className={cn("aspect-square h-full w-full object-cover", className)}
                {...props as any}
            />
        )
    }
)
AvatarImage.displayName = "AvatarImage"

export const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-zinc-400 font-medium",
                className
            )}
            {...props}
        />
    )
)
AvatarFallback.displayName = "AvatarFallback"
