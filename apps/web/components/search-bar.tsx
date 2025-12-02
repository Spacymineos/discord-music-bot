'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Play, X, Loader2 } from 'lucide-react'
import { searchTracks } from '@/lib/music-api'
import Image from 'next/image'
import { useMusicActions } from '@/hooks/use-music-actions'
import { showToast } from './ui/toaster'

interface SearchBarProps {
    guildId: string
    userId: string
    channelId: string
}

interface SearchResult {
    title: string
    author: string
    url: string
    duration: number
    thumbnail: string | null
}

export default function SearchBar({ guildId, userId, channelId }: SearchBarProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)

    const { play } = useMusicActions({ guildId, userId, channelId })

    // Real-time auto-search with debouncing
    const handleAutoSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([])
            setIsSearching(false)
            return
        }

        setIsSearching(true)

        try {
            const data = await searchTracks(guildId, searchQuery)
            setResults(data.tracks || [])
        } catch (error) {
            console.error('Search failed:', error)
            const errorMessage = error instanceof Error ? error.message : 'Search failed. Please try again.'
            showToast.error('Search Error', errorMessage)
            setResults([])
        } finally {
            setIsSearching(false)
        }
    }, [guildId])

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            handleAutoSearch(query)
        }, 4000) // 400ms debounce

        return () => clearTimeout(timer)
    }, [query, handleAutoSearch])

    const handlePlay = async (trackUrl: string) => {
        try {
            await play(trackUrl)
            setQuery('')
            setResults([])
            showToast.success('Track Added', 'Track has been added to the queue')
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to play track'
            showToast.error('Playback Error', errorMessage)
        }
    }

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000)
        const seconds = Math.floor((ms % 60000) / 1000)
        return `${minutes}:${String(seconds).padStart(2, '0')}`
    }

    return (
        <div className="relative w-full">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for songs, artists, or playlists..."
                    className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/10 rounded-full text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 focus:bg-white/15 transition-all"
                />

                {/* Loading or Clear Button */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isSearching ? (
                        <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
                    ) : query ? (
                        <button
                            onClick={() => {
                                setQuery('')
                                setResults([])
                            }}
                            className="text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
                {results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 w-full bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
                    >
                        <div className="p-2">
                            {results.map((track, index) => (
                                <motion.div
                                    key={`${track.url}-${index}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <div
                                        onClick={() => handlePlay(track.url)}
                                        className="p-3 hover:bg-white/10 rounded-xl transition-colors cursor-pointer group flex items-center gap-3"
                                    >
                                        <div className="w-12 h-12 rounded bg-zinc-800 overflow-hidden flex-shrink-0 relative">
                                            {track.thumbnail ? (
                                                <Image
                                                    src={track.thumbnail}
                                                    alt={track.title}
                                                    width={48}
                                                    height={48}
                                                    className="w-full h-full object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Play className="w-5 h-5 text-zinc-600" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Play className="w-6 h-6 text-white fill-current" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate text-white group-hover:text-green-400 transition-colors text-sm">
                                                {track.title}
                                            </h3>
                                            <p className="text-xs text-zinc-400 truncate">{track.author}</p>
                                        </div>
                                        <span className="text-xs text-zinc-500 font-mono">
                                            {formatDuration(track.duration)}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
