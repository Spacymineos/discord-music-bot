'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Music, List, Users, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { SignOutButton } from "@/components/sign-out-button"
import MusicPlayer from "@/components/music-player"
import QueueSidebar from "@/components/queue-sidebar"
import SearchBar from "@/components/search-bar"
import PlaylistsList from "@/components/playlists-list"
import RoomsList from "@/components/rooms-list"
import { usePlayerStore } from '@/lib/player-store'
import { getQueue } from '@/lib/music-api'

import { Guild } from "@/lib/types"
import { Session } from "next-auth"

interface MusicDashboardProps {
    guild: Guild
    session: Session
}

export default function MusicDashboard({ guild, session }: MusicDashboardProps) {
    const [queueOpen, setQueueOpen] = useState(false)
    const { setGuildId, setCurrentTrack, setQueue, setVolume, setPaused, setPlaying } = usePlayerStore()

    useEffect(() => {
        setGuildId(guild.id)

        // Fetch queue initially
        async function fetchQueue() {
            try {
                const data = await getQueue(guild.id)
                setCurrentTrack(data.current)
                setQueue(data.tracks)
                setVolume(data.volume)
                setPaused(data.paused)
                setPlaying(data.playing)
            } catch (error) {
                console.error('Failed to fetch queue:', error)
            }
        }

        fetchQueue()

        // Poll for updates
        const interval = setInterval(fetchQueue, 5000)
        return () => clearInterval(interval)
    }, [guild.id, setGuildId, setCurrentTrack, setQueue, setVolume, setPaused, setPlaying])

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100 pb-28">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl fixed h-full z-30">
                <div className="p-6 border-b border-zinc-800/50">
                    <div className="flex items-center gap-3">
                        {guild.icon ? (
                            <Image
                                src={guild.icon}
                                alt={guild.name}
                                width={40}
                                height={40}
                                className="rounded-xl shadow-lg"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold">
                                {guild.name.charAt(0)}
                            </div>
                        )}
                        <span className="font-bold truncate">{guild.name}</span>
                    </div>
                </div>
                <nav className="p-4 space-y-2">
                    <Button variant="secondary" className="w-full justify-start gap-2 bg-indigo-500/10 text-indigo-400">
                        <Music className="w-4 h-4" />
                        Music
                    </Button>
                    <Link href={`/guild/${guild.id}/settings`}>
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Settings className="w-4 h-4" />
                            Settings
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        onClick={() => setQueueOpen(true)}
                    >
                        <List className="w-4 h-4" />
                        Queue
                    </Button>
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-zinc-800/50">
                    <SignOutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                                Music Player
                            </h1>
                            <p className="text-zinc-400 mt-2">Search and play your favorite tracks</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setQueueOpen(true)}
                            className="gap-2"
                        >
                            <List className="w-4 h-4" />
                            View Queue
                        </Button>
                    </motion.div>

                    {/* Search */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <SearchBar
                            guildId={guild.id}
                            userId={session.user.id}
                            channelId={guild.id}
                        />
                    </motion.div>

                    {/* Quick Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-3 gap-6"
                    >
                        <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{(guild.memberCount || 0).toLocaleString()}</p>
                                    <p className="text-sm text-zinc-400">Members</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                    <Music className="w-6 h-6 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">Ready</p>
                                    <p className="text-sm text-zinc-400">Player Status</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-pink-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">Active</p>
                                    <p className="text-sm text-zinc-400">Bot Status</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Playlists Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <PlaylistsList
                                guildId={guild.id}
                                userId={session.user.id}
                                channelId={guild.id}
                            />
                        </motion.div>

                        {/* Rooms Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <RoomsList
                                guildId={guild.id}
                                userId={session.user.id}
                            />
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Music Player */}
            <MusicPlayer />

            {/* Queue Sidebar */}
            <QueueSidebar isOpen={queueOpen} onClose={() => setQueueOpen(false)} />
        </div>
    )
}
