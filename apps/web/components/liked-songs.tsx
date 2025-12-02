'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Heart, Clock, Pause, Music } from 'lucide-react'
import { Button } from './ui/button'
import { getLikedSongs, toggleLike, Track } from '@/lib/music-api'

import { usePlayerStore } from '@/lib/player-store'
import { cn } from '@/lib/utils'
import { useMusicActions } from '@/hooks/use-music-actions'

interface LikedSongsProps {
    guildId: string
    userId: string
    channelId: string
}

export default function LikedSongs({ guildId, userId, channelId }: LikedSongsProps) {
    const [tracks, setTracks] = useState<Track[]>([])
    const [loading, setLoading] = useState(true)
    const { currentTrack, playing, paused } = usePlayerStore()

    const { play } = useMusicActions({ guildId, userId, channelId })

    const fetchLikedSongs = async () => {
        try {
            const data = await getLikedSongs(guildId, userId)
            setTracks(data.tracks)
        } catch (error) {
            console.error('Failed to fetch liked songs:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLikedSongs()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [guildId, userId])

    const handlePlay = async (track?: Track) => {
        try {
            // If no track specified, play the first one (or the whole playlist logic if we had it)
            // For now, playing the playlist isn't directly supported by the API as "play playlist", 
            // but we can play the first track. 
            // Ideally we'd send the whole playlist to the queue.

            const query = track ? track.url : 'Liked Songs' // 'Liked Songs' might be interpreted by the bot as a playlist request if implemented
            await play(query)
        } catch (error) {
            console.error('Failed to play:', error)
        }
    }

    const handleUnlike = async (track: Track) => {
        try {
            // Optimistic update
            setTracks(prev => prev.filter(t => t.url !== track.url))
            await toggleLike(guildId, userId, track)
        } catch (error) {
            console.error('Failed to unlike:', error)
            fetchLikedSongs() // Revert on error
        }
    }

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000)
        const seconds = Math.floor((ms % 60000) / 1000)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const isCurrentTrack = (track: Track) => {
        return currentTrack?.url === track.url
    }

    const isPlaying = (track: Track) => {
        return isCurrentTrack(track) && playing && !paused
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 items-end">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-52 h-52 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/20"
                >
                    <Heart className="w-24 h-24 text-white fill-white" />
                </motion.div>

                <div className="flex-1 space-y-4 mb-2">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Playlist</h2>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mt-2 mb-4">Liked Songs</h1>
                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold">
                                {userId.slice(0, 1).toUpperCase()}
                            </div>
                            <span className="font-bold text-white">You</span>
                            <span>•</span>
                            <span>{tracks.length} songs</span>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Button
                        size="icon"
                        onClick={() => handlePlay()}
                        className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 text-black shadow-xl hover:scale-105 transition-transform"
                    >
                        <Play className="w-6 h-6 fill-current ml-1" />
                    </Button>
                </motion.div>
            </div>

            {/* Tracks List */}
            <div className="bg-black/20 rounded-xl overflow-hidden backdrop-blur-sm border border-white/5">
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 border-b border-white/5 text-sm font-medium text-zinc-400 uppercase tracking-wider">
                    <div className="w-8 text-center">#</div>
                    <div>Title</div>
                    <div className="hidden md:block">Date Added</div>
                    <div className="w-12 text-right"><Clock className="w-4 h-4 ml-auto" /></div>
                </div>

                <div className="divide-y divide-white/5">
                    {tracks.map((track, index) => (
                        <div
                            key={track.url}
                            className={cn(
                                "group grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 items-center hover:bg-white/5 transition-colors cursor-pointer",
                                isCurrentTrack(track) && "bg-white/5"
                            )}
                            onClick={() => handlePlay(track)}
                        >
                            <div className="w-8 text-center text-zinc-500 font-mono text-sm group-hover:hidden">
                                {isCurrentTrack(track) && (playing && !paused) ? (
                                    <div className="w-3 h-3 mx-auto bg-green-500 rounded-full animate-pulse" />
                                ) : (
                                    index + 1
                                )}
                            </div>
                            <div className="w-8 hidden group-hover:flex items-center justify-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8 text-white hover:text-green-500"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handlePlay(track)
                                    }}
                                >
                                    {isPlaying(track) ? (
                                        <Pause className="w-4 h-4 fill-current" />
                                    ) : (
                                        <Play className="w-4 h-4 fill-current" />
                                    )}
                                </Button>
                            </div>

                            <div className="min-w-0">
                                <div className={cn("font-medium truncate", isCurrentTrack(track) ? "text-green-500" : "text-white")}>
                                    {track.title}
                                </div>
                                <div className="text-sm text-zinc-400 truncate group-hover:text-zinc-300">
                                    {track.author}
                                </div>
                            </div>

                            <div className="hidden md:block text-sm text-zinc-500">
                                {/* Date added would go here if available in Track interface */}
                                Just now
                            </div>

                            <div className="flex items-center gap-4 justify-end">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8 text-green-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleUnlike(track)
                                    }}
                                >
                                    <Heart className="w-4 h-4 fill-current" />
                                </Button>
                                <span className="text-sm text-zinc-500 font-mono w-10 text-right">
                                    {formatDuration(track.duration)}
                                </span>
                            </div>
                        </div>
                    ))}

                    {tracks.length === 0 && (
                        <div className="py-12 text-center text-zinc-500">
                            <Music className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No liked songs yet</p>
                            <p className="text-sm mt-1">Click the heart icon on the player to add songs</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
