'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Music, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getLyrics } from '@/lib/music-api'
import { usePlayerStore } from '@/lib/player-store'


interface LyricsPanelProps {
    isOpen: boolean
    onClose: () => void
    guildId: string
}

export default function LyricsPanel({ isOpen, onClose, guildId }: LyricsPanelProps) {
    const { currentTrack } = usePlayerStore()
    const [lyrics, setLyrics] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && currentTrack) {
            fetchLyrics()
        } else if (!isOpen) {
            // Reset state when closed
            setLyrics(null)
            setError(null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, currentTrack?.title])

    const fetchLyrics = async () => {
        if (!currentTrack) return

        setLoading(true)
        setError(null)
        setLyrics(null)

        try {
            const query = `${currentTrack.title} ${currentTrack.author}`
            const data = await getLyrics(guildId, query)

            if (data.lyrics) {
                setLyrics(data.lyrics)
            } else {
                setError('No lyrics found for this track')
            }
        } catch (err) {
            console.error('Failed to fetch lyrics:', err)
            setError('Failed to load lyrics')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 300 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Music className="w-5 h-5 text-green-400" />
                                Lyrics
                            </h2>
                            {currentTrack && (
                                <p className="text-sm text-zinc-400 truncate max-w-[250px] mt-1">
                                    {currentTrack.title}
                                </p>
                            )}
                        </div>
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
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                                <p>Searching for lyrics...</p>
                            </div>
                        ) : error ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center">
                                <Music className="w-12 h-12 mb-4 opacity-20" />
                                <p className="mb-2">{error}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchLyrics}
                                    className="mt-4 border-zinc-700 hover:bg-zinc-800"
                                >
                                    Try Again
                                </Button>
                            </div>
                        ) : lyrics ? (
                            <div className="prose prose-invert max-w-none">
                                <div className="whitespace-pre-wrap font-medium text-lg leading-relaxed text-zinc-300">
                                    {lyrics}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                                <p>Play a song to see lyrics</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
