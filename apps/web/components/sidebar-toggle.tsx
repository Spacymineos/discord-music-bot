'use client'

import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarToggleProps {
    collapsed: boolean
    onToggle: () => void
    className?: string
}

export default function SidebarToggle({ collapsed, onToggle, className }: SidebarToggleProps) {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
                "h-6 w-6 rounded-full bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-700 shadow-lg absolute -right-3 top-6 z-50 transition-transform",
                collapsed && "rotate-180",
                className
            )}
        >
            <ChevronLeft className="h-3 w-3" />
        </Button>
    )
}
