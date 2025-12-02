'use client'

import { Toaster as Sonner, toast } from 'sonner'

export function Toaster() {
    return (
        <Sonner
            position="bottom-right"
            richColors
            closeButton
            theme="dark"
            toastOptions={{
                classNames: {
                    toast: 'bg-zinc-900 border border-white/10 shadow-2xl',
                    title: 'text-white font-medium',
                    description: 'text-zinc-400',
                    actionButton: 'bg-green-500 text-black',
                    cancelButton: 'bg-zinc-700 text-white',
                    closeButton: 'bg-zinc-800 border-white/10',
                },
            }}
        />
    )
}

// Custom toast functions without icons
export const showToast = {
    success: (message: string, description?: string) => {
        toast.success(message, {
            description,
        })
    },
    error: (message: string, description?: string) => {
        toast.error(message, {
            description,
        })
    },
    info: (message: string, description?: string) => {
        toast.info(message, {
            description,
        })
    },
    warning: (message: string, description?: string) => {
        toast.warning(message, {
            description,
        })
    },
}
