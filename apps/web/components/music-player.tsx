'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Heart, Repeat, Shuffle, Maximize2 } from 'lucide-react'
import { usePlayerStore } from '@/lib/player-store'
import { togglePause, skipTrack, setVolume as setVolumeApi, shuffleQueue, toggleLoop } from '@/lib/music-api'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MusicPlayerProps {
    onArtistClick?: (artistName: string) => void
}

export default function MusicPlayer({ onArtistClick }: MusicPlayerProps = {}) {
    const { currentTrack, paused, volume, guildId, position } = usePlayerStore()
    const [localVolume, setLocalVolume] = useState(volume)
    const [localPosition, setLocalPosition] = useState(position)
    const [isLiked, setIsLiked] = useState(false)
    const [isHoveringProgress, setIsHoveringProgress] = useState(false)
    const [repeatMode, setRepeatMode] = useState<'none' | 'track' | 'queue'>('none')
    const [isShuffled, setIsShuffled] = useState(false)
    const progressBarRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setLocalVolume(volume)
    }, [volume])

    useEffect(() => {
        setLocalPosition(position)
    }, [position])

    useEffect(() => {
        if (paused || !currentTrack) return
        const interval = setInterval(() => {
            setLocalPosition(prev => {
                if (prev >= currentTrack.duration) return prev
                return prev + 1000
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [paused, currentTrack])

    const handlePlayPause = async () => {
        if (!guildId) return
        try {
            await togglePause(guildId)
        } catch (error) {
            console.error(error)
        }
    }

    const handleSkip = async () => {
        if (!guildId) return
        try {
            await skipTrack(guildId)
        } catch (error) {
            console.error(error)
        }
    }

    const handleVolumeChange = async (val: number) => {
        setLocalVolume(val)
        if (!guildId) return
        try {
            await setVolumeApi(guildId, val)
        } catch (error) {
            console.error(error)
        }
    }

    const handleLikeToggle = () => {
        setIsLiked(!isLiked)
        // TODO: Implement actual like functionality
    }

    const handleShuffle = async () => {
        if (!guildId) return
        try {
            await shuffleQueue(guildId)
            setIsShuffled(!isShuffled)
        } catch (error) {
            console.error(error)
        }
    }

    const handleRepeat = async () => {
        if (!guildId) return
        try {
            const result = await toggleLoop(guildId)
            if (result.loop) {
                setRepeatMode(result.loop)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const formatDuration = (ms: number) => {
        if (!ms) return '0:00'
        const minutes = Math.floor(ms / 60000)
        const seconds = Math.floor((ms % 60000) / 1000)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current || !currentTrack || !guildId) return
        const rect = progressBarRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = Math.max(0, Math.min(1, x / rect.width))
        const newPosition = percentage * currentTrack.duration
        setLocalPosition(newPosition)

        // Seek to new position
        fetch(`${process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:3001'}/music/${guildId}/seek`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ position: Math.floor(newPosition) })
        }).catch(err => console.error('Failed to seek:', err))
    }

    if (!currentTrack) return null

    const progressPercent = Math.min((localPosition / currentTrack.duration) * 100, 100)

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative h-full w-full bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 backdrop-blur-2xl shadow-2xl"
        >
            {/* Ambient background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-purple-500/5 pointer-events-none" />

            <div className="relative h-full px-6 flex items-center justify-between gap-6">
                {/* Left: Track Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative group"
                    >
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                            {currentTrack.thumbnail ? (
                                <Image
                                    src={currentTrack.thumbnail}
                                    alt={currentTrack.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                    <span className="text-3xl">🎵</span>
                                </div>
                            )}
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        {/* Pulsing ring when playing */}
                        <AnimatePresence>
                            {!paused && (
                                <motion.div
                                    initial={{ scale: 1, opacity: 0.5 }}
                                    animate={{ scale: 1.2, opacity: 0 }}
                                    exit={{ scale: 1, opacity: 0 }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute inset-0 rounded-xl ring-2 ring-green-500"
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <div className="flex-1 min-w-0">
                        <motion.h3
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="font-semibold text-white text-base line-clamp-1 mb-0.5"
                        >
                            {currentTrack.title}
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            onClick={() => onArtistClick?.(currentTrack.author)}
                            className="text-sm text-zinc-400 line-clamp-1 hover:text-green-400 hover:underline transition-colors cursor-pointer"
                        >
                            {currentTrack.author}
                        </motion.p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLikeToggle}
                        className="text-zinc-400 hover:text-green-500 transition-all p-2 rounded-full hover:bg-white/5"
                    >
                        <Heart
                            className={cn(
                                "w-5 h-5 transition-all",
                                isLiked && "fill-green-500 text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                            )}
                        />
                    </motion.button>
                </div>

                {/* Center: Controls */}
                <div className="flex flex-col items-center gap-3 flex-1 max-w-2xl">
                    {/* Control Buttons */}
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleShuffle}
                            className={cn(
                                "transition-all p-2 rounded-full hover:bg-white/5",
                                isShuffled ? "text-green-400" : "text-zinc-400 hover:text-white"
                            )}
                        >
                            <Shuffle className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-zinc-400 hover:text-white transition-all p-2.5 rounded-full hover:bg-white/5"
                        >
                            <SkipBack className="w-5 h-5" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePlayPause}
                            className="relative w-12 h-12 rounded-full bg-white hover:bg-green-500 shadow-xl hover:shadow-green-500/20 flex items-center justify-center group transition-all"
                        >
                            <AnimatePresence mode="wait">
                                {paused ? (
                                    <motion.div
                                        key="play"
                                        initial={{ scale: 0, rotate: -90 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0, rotate: 90 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Play className="w-5 h-5 text-black ml-0.5 fill-current" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="pause"
                                        initial={{ scale: 0, rotate: -90 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0, rotate: 90 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Pause className="w-5 h-5 text-black fill-current" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Glow effect when playing */}
                            {!paused && (
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-green-500/20"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            )}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSkip}
                            className="text-zinc-400 hover:text-white transition-all p-2.5 rounded-full hover:bg-white/5"
                        >
                            <SkipForward className="w-5 h-5" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRepeat}
                            className={cn(
                                "transition-all p-2 rounded-full hover:bg-white/5 relative",
                                repeatMode !== 'none' ? "text-green-400" : "text-zinc-400 hover:text-white"
                            )}
                        >
                            <Repeat className="w-4 h-4" />
                            {repeatMode === 'track' && (
                                <span className="absolute -top-1 -right-1 text-[10px] font-bold text-green-400">1</span>
                            )}
                        </motion.button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full flex items-center gap-3 group/progress">
                        <span className="text-xs text-zinc-500 font-mono tabular-nums min-w-[40px] text-right">
                            {formatDuration(localPosition)}
                        </span>

                        <div
                            ref={progressBarRef}
                            onClick={handleProgressClick}
                            onMouseEnter={() => setIsHoveringProgress(true)}
                            onMouseLeave={() => setIsHoveringProgress(false)}
                            className="relative flex-1 h-1.5 bg-zinc-700/50 rounded-full overflow-visible cursor-pointer group/bar"
                        >
                            {/* Background track */}
                            <div className="absolute inset-0 bg-zinc-700/50 rounded-full" />

                            {/* Progress fill */}
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                style={{ width: `${progressPercent}%` }}
                                animate={{
                                    boxShadow: isHoveringProgress
                                        ? '0 0 20px rgba(34, 197, 94, 0.6)'
                                        : '0 0 0px rgba(34, 197, 94, 0)'
                                }}
                            />

                            {/* Hover indicator */}
                            <AnimatePresence>
                                {isHoveringProgress && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
                                        style={{ left: `${progressPercent}%`, marginLeft: '-6px' }}
                                    />
                                )}
                            </AnimatePresence>
                        </div>

                        <span className="text-xs text-zinc-500 font-mono tabular-nums min-w-[40px]">
                            {formatDuration(currentTrack.duration || 0)}
                        </span>
                    </div>
                </div>

                {/* Right: Volume & Additional Controls */}
                <div className="flex items-center gap-4 flex-1 justify-end min-w-0">
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleVolumeChange(localVolume === 0 ? 50 : 0)}
                            className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
                        >
                            {localVolume === 0 ? (
                                <VolumeX className="w-5 h-5" />
                            ) : (
                                <Volume2 className="w-5 h-5" />
                            )}
                        </motion.button>

                        <div className="relative group/volume w-28">
                            <div className="h-1.5 bg-zinc-700/50 rounded-full overflow-hidden">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={localVolume}
                                    onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <motion.div
                                    className="h-full bg-gradient-to-r from-zinc-400 to-white rounded-full"
                                    style={{ width: `${localVolume}%` }}
                                    animate={{
                                        boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom accent line */}
            <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500"
                style={{ width: `${progressPercent}%` }}
                animate={{
                    opacity: paused ? 0.3 : 1
                }}
            />
        </motion.div>
    )
}
