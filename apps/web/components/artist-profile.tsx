'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Clock, Music, ArrowLeft, PlayCircle } from 'lucide-react'
import Image from 'next/image'
import { useMusicActions } from '@/hooks/use-music-actions'
import { showToast } from '@/components/ui/toaster'
import { getArtistTracks } from '@/lib/music-api'

interface ArtistProfileProps {
    artistName: string
    guildId: string
    userId: string
    channelId: string
    onBack: () => void
}

interface Track {
    title: string
    author: string
    url: string
    duration: number
    thumbnail: string | null
}

export default function ArtistProfile({ artistName, guildId, userId, channelId, onBack }: ArtistProfileProps) {
    const [tracks, setTracks] = useState<Track[]>([])
    const [artistImage, setArtistImage] = useState<string | null>(null)
    const [artistBanner, setArtistBanner] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const { play } = useMusicActions({ guildId, userId, channelId })

    useEffect(() => {
        const fetchArtistTracks = async () => {
            try {
                const data = await getArtistTracks(guildId, artistName)
                setTracks(data.tracks || [])
                if (data.artist && typeof data.artist === 'object') {
                    if (data.artist.image) setArtistImage(data.artist.image)
                    if (data.artist.banner) setArtistBanner(data.artist.banner)
                }
            } catch (error) {
                console.error('Error fetching artist tracks:', error)
                showToast.error('Error', 'Failed to load artist profile')
            } finally {
                setLoading(false)
            }
        }

        fetchArtistTracks()
    }, [artistName, guildId])

    const handlePlay = async (trackUrl: string) => {
        try {
            await play(trackUrl)
            showToast.success('Added to Queue', 'Track added to queue')
        } catch {
            showToast.error('Playback Error', 'Failed to play track')
        }
    }

    const handlePlayAll = async () => {
        if (tracks.length === 0) return
        try {
            for (const track of tracks) {
                await play(track.url)
            }
            showToast.success('Playing All', `Added ${tracks.length} tracks to queue`)
        } catch {
            showToast.error('Playback Error', 'Failed to play all tracks')
        }
    }

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000)
        const seconds = Math.floor((ms % 60000) / 1000)
        return `${minutes}:${String(seconds).padStart(2, '0')}`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="relative h-80 rounded-3xl overflow-hidden bg-gradient-to-br from-green-500/20 via-emerald-600/10 to-zinc-900 border border-white/10">
                {artistBanner && (
                    <div className="absolute inset-0">
                        <Image
                            src={artistBanner}
                            alt="Banner"
                            fill
                            className="object-cover opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
                    </div>
                )}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.15),transparent_50%)]" />

                <div className="relative z-10 h-full flex flex-col justify-between p-8">
                    <motion.button
                        whileHover={{ scale: 1.05, x: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onBack}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors w-fit"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </motion.button>

                    <div className="flex items-end gap-6">
                        <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/10">
                            {artistImage ? (
                                <Image
                                    src={artistImage}
                                    alt={artistName}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                    <Music className="w-16 h-16 text-white" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">Artist</p>
                            <h1 className="text-6xl font-black text-white mb-4 tracking-tight">
                                {artistName}
                            </h1>
                            <div className="flex items-center gap-4 text-zinc-400">
                                <span className="text-sm font-medium">{tracks.length} tracks</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Play All Button */}
            {tracks.length > 0 && (
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePlayAll}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-black font-bold text-lg shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all"
                >
                    <PlayCircle className="w-6 h-6" />
                    Play All
                </motion.button>
            )}

            {/* Tracks List */}
            {tracks.length > 0 ? (
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white mb-4 px-4">Popular Tracks</h2>

                    <div className="space-y-1">
                        {tracks.map((track, index) => (
                            <motion.div
                                key={`${track.url}-${index}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                                onClick={() => handlePlay(track.url)}
                            >
                                {/* Index / Play Button */}
                                <div className="relative w-10 flex-shrink-0 text-center">
                                    <span className="text-zinc-500 group-hover:opacity-0 transition-opacity">
                                        {index + 1}
                                    </span>
                                    <Play className="w-5 h-5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                {/* Thumbnail */}
                                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                                    {track.thumbnail ? (
                                        <Image
                                            src={track.thumbnail}
                                            alt={track.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                            <Music className="w-6 h-6 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Track Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white line-clamp-1 group-hover:text-green-400 transition-colors">
                                        {track.title}
                                    </h3>
                                    <p className="text-sm text-zinc-400 line-clamp-1">
                                        {track.author}
                                    </p>
                                </div>

                                {/* Duration */}
                                <div className="flex items-center gap-2 text-zinc-500 flex-shrink-0">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-mono tabular-nums">
                                        {formatDuration(track.duration)}
                                    </span>
                                </div>

                                {/* Hover Effect */}
                                <div className="absolute inset-0 rounded-xl ring-1 ring-green-500/0 group-hover:ring-green-500/30 transition-all pointer-events-none" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-20">
                    <Music className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Tracks Found</h3>
                    <p className="text-zinc-400">
                        No tracks found for this artist
                    </p>
                </div>
            )}
        </div>
    )
}
