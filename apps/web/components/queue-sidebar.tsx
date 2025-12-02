'use client'

import { motion } from 'framer-motion'
import { X, Music } from 'lucide-react'
import { usePlayerStore } from '@/lib/player-store'
import { Button } from './ui/button'
import Image from 'next/image'

interface QueueSidebarProps {
    isOpen: boolean
    onClose: () => void
}

export default function QueueSidebar({ isOpen, onClose }: QueueSidebarProps) {
    const { queue, currentTrack } = usePlayerStore()

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                />
            )}

            {/* Sidebar */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: isOpen ? 0 : '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-96 bg-zinc-950 border-l border-zinc-900 z-50 overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Queue</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Current Track */}
                {currentTrack && (
                    <div className="p-6 border-b border-zinc-800">
                        <p className="text-xs text-zinc-500 mb-3">NOW PLAYING</p>
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                                {currentTrack.thumbnail ? (
                                    <Image
                                        src={currentTrack.thumbnail}
                                        alt={currentTrack.title}
                                        width={56}
                                        height={56}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Music className="w-6 h-6 text-zinc-600" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-sm truncate">{currentTrack.title}</h3>
                                <p className="text-xs text-zinc-400 truncate">{currentTrack.author}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Queue List */}
                <div className="flex-1 overflow-y-auto">
                    {queue.length > 0 ? (
                        <div className="p-6 space-y-3">
                            <p className="text-xs text-zinc-500 mb-3">UP NEXT</p>
                            {queue.map((track, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                                >
                                    <span className="text-sm text-zinc-500 w-6">{index + 1}</span>
                                    <div className="w-12 h-12 rounded bg-zinc-800 overflow-hidden flex-shrink-0">
                                        {track.thumbnail ? (
                                            <Image
                                                src={track.thumbnail}
                                                alt={track.title}
                                                width={48}
                                                height={48}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Music className="w-5 h-5 text-zinc-600" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm truncate group-hover:text-white transition-colors">{track.title}</h4>
                                        <p className="text-xs text-zinc-500 truncate">{track.author}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-6">
                            <div className="text-center">
                                <Music className="w-12 h-12 text-zinc-800 mx-auto mb-3" />
                                <p className="text-zinc-500">
                                    {currentTrack ? 'No upcoming tracks' : 'Queue is empty'}
                                </p>
                                <p className="text-xs text-zinc-600 mt-1">
                                    {currentTrack ? 'Add more tracks to keep the party going' : 'Add some tracks to get started'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    )
}
