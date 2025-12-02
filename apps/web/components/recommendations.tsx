'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Music } from 'lucide-react'
import { getSimilarTracks, getTrendingTracks, getPersonalizedRecommendations } from '@/lib/voice-api'
import Image from 'next/image'
import { useMusicActions } from '@/hooks/use-music-actions'

interface RecommendationsProps {
    guildId: string
    userId: string
    channelId: string
}

interface Track {
    title: string
    author: string
    url: string
    duration: number
    thumbnail: string | null
}

export default function Recommendations({ guildId, userId, channelId }: RecommendationsProps) {
    const [activeTab, setActiveTab] = useState<'similar' | 'trending' | 'foryou'>('foryou')
    const [tracks, setTracks] = useState<Track[]>([])
    const [loading, setLoading] = useState(false)

    const { play } = useMusicActions({ guildId, userId, channelId })

    useEffect(() => {
        async function fetchRecommendations() {
            setLoading(true)
            try {
                let data
                if (activeTab === 'similar') {
                    data = await getSimilarTracks(guildId)
                    setTracks(data.recommendations || [])
                } else if (activeTab === 'trending') {
                    data = await getTrendingTracks(guildId)
                    setTracks(data.trending || [])
                } else {
                    data = await getPersonalizedRecommendations(guildId)
                    setTracks(data.recommendations || [])
                }
            } catch (error) {
                console.error('Failed to fetch recommendations:', error)
                setTracks([])
            } finally {
                setLoading(false)
            }
        }

        fetchRecommendations()
    }, [activeTab, guildId])

    const handlePlay = async (trackUrl: string) => {
        try {
            await play(trackUrl)
        } catch (error) {
            console.error('Failed to play track:', error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex items-center gap-4 border-b border-white/5 pb-1">
                <button
                    onClick={() => setActiveTab('foryou')}
                    className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'foryou' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                    For You
                    {activeTab === 'foryou' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('similar')}
                    className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'similar' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                    Similar to History
                    {activeTab === 'similar' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('trending')}
                    className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'trending' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                    Trending Now
                    {activeTab === 'trending' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
                    )}
                </button>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loading ? (
                    [...Array(8)].map((_, i) => (
                        <div key={i} className="aspect-[4/5] bg-white/5 rounded-xl animate-pulse" />
                    ))
                ) : tracks.length > 0 ? (
                    tracks.map((track, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handlePlay(track.url)}
                            className="group relative flex flex-col gap-3 cursor-pointer"
                        >
                            {/* Thumbnail Card */}
                            <div className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-800 relative shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1">
                                {track.thumbnail ? (
                                    <Image
                                        src={track.thumbnail}
                                        alt={track.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                        <Music className="w-10 h-10 text-zinc-600" />
                                    </div>
                                )}

                                {/* Overlay Play Button */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xl transform scale-50 group-hover:scale-100 transition-transform duration-300">
                                        <Play className="w-5 h-5 text-black fill-black ml-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="min-w-0">
                                <h3 className="font-bold text-white truncate group-hover:text-green-400 transition-colors">
                                    {track.title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                    <span className="truncate max-w-[150px]">{track.author}</span>
                                    <span>•</span>
                                    <span>Video</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <div className="inline-flex p-4 rounded-full bg-zinc-900 mb-4">
                            <Music className="w-8 h-8 text-zinc-600" />
                        </div>
                        <p className="text-zinc-400">No recommendations found</p>
                        <p className="text-sm text-zinc-500 mt-1">Try playing some music first!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
