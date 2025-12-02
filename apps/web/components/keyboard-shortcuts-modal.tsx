'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KeyboardShortcutsModalProps {
    isOpen: boolean
    onClose: () => void
}

const shortcuts = [
    {
        category: 'Playback Controls',
        items: [
            { keys: ['Space'], description: 'Play / Pause' },
            { keys: ['→'], description: 'Skip to next track' },
            { keys: ['←'], description: 'Restart current track' },
            { keys: ['M'], description: 'Mute / Unmute' },
        ]
    },
    {
        category: 'Volume Controls',
        items: [
            { keys: ['↑'], description: 'Increase volume (+5%)' },
            { keys: ['↓'], description: 'Decrease volume (-5%)' },
        ]
    },
    {
        category: 'Playback Modes',
        items: [
            { keys: ['S'], description: 'Toggle Shuffle' },
            { keys: ['R'], description: 'Cycle Repeat Mode (Off → All → One)' },
        ]
    },
    {
        category: 'Quick Actions',
        items: [
            { keys: ['L'], description: 'View Lyrics (opens panel)' },
            { keys: ['?'], description: 'Show this help menu' },
        ]
    }
]

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Keyboard className="w-5 h-5 text-green-500" />
                                Keyboard Shortcuts
                            </h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid gap-6">
                                {shortcuts.map((section) => (
                                    <div key={section.category}>
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3">
                                            {section.category}
                                        </h3>
                                        <div className="space-y-2">
                                            {section.items.map((item) => (
                                                <div
                                                    key={item.description}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                                >
                                                    <span className="text-sm text-zinc-200">
                                                        {item.description}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {item.keys.map((key) => (
                                                            <kbd
                                                                key={key}
                                                                className="px-3 py-1.5 text-xs font-mono font-bold bg-zinc-800 border border-zinc-700 rounded-md text-white shadow-sm"
                                                            >
                                                                {key}
                                                            </kbd>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 bg-black/20">
                            <p className="text-sm text-zinc-400 text-center">
                                💡 <strong>Pro Tip:</strong> Shortcuts work anywhere in the app, except when typing in input fields
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
