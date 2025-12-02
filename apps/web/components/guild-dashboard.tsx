'use client'

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Clock, Users, List, ChevronLeft, ChevronRight, Settings, Search as SearchIcon } from "lucide-react"
import QueueSidebar from "@/components/queue-sidebar"
import SearchBar from "@/components/search-bar"
import MusicPlayer from "@/components/music-player"
import Recommendations from "@/components/recommendations"
import { Button } from "@/components/ui/button"
import UserDropdown from "@/components/user-dropdown"
import History from "@/components/history"
import LyricsPanel from "@/components/lyrics/lyrics-panel"
import SettingsModal from "@/components/settings/settings-modal"
import KeyboardShortcutsModal from "@/components/keyboard-shortcuts-modal"
import ArtistProfile from "@/components/artist-profile"
import { usePlayerStore } from '@/lib/player-store'
import { getQueue } from '@/lib/music-api'
import { Guild } from "@/lib/types"
import { Session } from "next-auth"
import { cn } from "@/lib/utils"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"

interface GuildDashboardProps {
    guild: Guild
    session: Session
}

export default function GuildDashboard({ guild, session }: GuildDashboardProps) {
    const [activeTab, setActiveTab] = useState('discover')
    const [queueOpen, setQueueOpen] = useState(false)
    const [lyricsOpen, setLyricsOpen] = useState(false)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [shortcutsOpen, setShortcutsOpen] = useState(false)
    const [selectedArtist, setSelectedArtist] = useState<string | null>(null)
    const { setGuildId, setCurrentTrack, setQueue, setVolume, setPaused, setPlaying, setPosition } = usePlayerStore()

    // Sidebar State
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [sidebarWidth, setSidebarWidth] = useState(280)
    const [isResizing, setIsResizing] = useState(false)
    const sidebarRef = useRef<HTMLElement>(null)

    // Enable keyboard shortcuts
    useKeyboardShortcuts({
        guildId: guild.id,
        enabled: true,
        onShowShortcuts: () => setShortcutsOpen(true)
    })

    useEffect(() => {
        setGuildId(guild.id)

        const fetchQueue = async () => {
            try {
                const data = await getQueue(guild.id)
                setCurrentTrack(data.current)
                setQueue(data.tracks)
                setVolume(data.volume)
                setPaused(data.paused)
                setPlaying(data.playing)
                if (data.position !== undefined) {
                    setPosition(data.position)
                }
            } catch (error) {
                console.error('Failed to fetch queue:', error)
            }
        }

        fetchQueue()
        const interval = setInterval(fetchQueue, 5000)
        return () => clearInterval(interval)
    }, [guild.id, setGuildId, setCurrentTrack, setQueue, setVolume, setPaused, setPlaying, setPosition])

    // Sidebar Resize Logic
    const startResizing = useCallback(() => {
        setIsResizing(true)
    }, [])

    const stopResizing = useCallback(() => {
        setIsResizing(false)
    }, [])

    const resize = useCallback((mouseMoveEvent: MouseEvent) => {
        if (isResizing) {
            const newWidth = mouseMoveEvent.clientX
            if (newWidth > 80 && newWidth < 400) {
                setSidebarWidth(newWidth)
                if (newWidth < 120 && !sidebarCollapsed) {
                    setSidebarCollapsed(true)
                } else if (newWidth >= 120 && sidebarCollapsed) {
                    setSidebarCollapsed(false)
                }
            }
        }
    }, [isResizing, sidebarCollapsed])

    useEffect(() => {
        window.addEventListener("mousemove", resize)
        window.addEventListener("mouseup", stopResizing)
        return () => {
            window.removeEventListener("mousemove", resize)
            window.removeEventListener("mouseup", stopResizing)
        }
    }, [resize, stopResizing])

    const NavItem = ({ id, icon: Icon, label }: { id: string, icon: React.ElementType, label: string }) => (
        <motion.button
            onClick={() => {
                setActiveTab(id)
                setSelectedArtist(null)
            }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                activeTab === id && !selectedArtist
                    ? "bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-white shadow-lg shadow-green-500/10"
                    : "text-zinc-400 hover:text-white hover:bg-white/5",
                sidebarCollapsed && "justify-center px-2"
            )}
            title={sidebarCollapsed ? label : undefined}
        >
            {activeTab === id && !selectedArtist && (
                <>
                    <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 w-1 h-full bg-gradient-to-b from-green-400 to-emerald-500 rounded-r-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                </>
            )}
            <Icon className={cn(
                "w-5 h-5 transition-colors flex-shrink-0 relative z-10",
                activeTab === id && !selectedArtist ? "text-green-400" : "group-hover:text-green-400"
            )} />
            {!sidebarCollapsed && (
                <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-medium text-sm truncate relative z-10"
                >
                    {label}
                </motion.span>
            )}
        </motion.button>
    )

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-zinc-100 overflow-hidden font-sans selection:bg-green-500/30">
            <div className="flex flex-1 overflow-hidden">
                {/* Redesigned Sidebar */}
                <motion.aside
                    ref={sidebarRef}
                    animate={{ width: sidebarCollapsed ? 80 : sidebarWidth }}
                    className="bg-zinc-950/50 backdrop-blur-xl flex flex-col gap-2 p-3 relative z-20 border-r border-white/5"
                >
                    {/* Server Header */}
                    <div className={cn("p-4 mb-2 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 rounded-xl border border-white/5", sidebarCollapsed && "p-3 flex justify-center")}>
                        <div className={cn("flex items-center gap-3", sidebarCollapsed && "px-0 justify-center")}>
                            <div className="relative">
                                {guild.icon ? (
                                    <Image
                                        src={guild.icon}
                                        alt={guild.name}
                                        width={sidebarCollapsed ? 40 : 48}
                                        height={sidebarCollapsed ? 40 : 48}
                                        className="rounded-xl ring-2 ring-green-500/20 shadow-lg"
                                    />
                                ) : (
                                    <div className={cn(
                                        "rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center font-bold shadow-lg",
                                        sidebarCollapsed ? "w-10 h-10 text-sm" : "w-12 h-12 text-lg"
                                    )}>
                                        {guild.name.charAt(0)}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-950 shadow-lg shadow-green-500/50" />
                            </div>
                            {!sidebarCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <span className="font-bold text-sm block truncate text-white">{guild.name}</span>
                                    <span className="text-xs text-zinc-500">Online</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1.5 px-2">
                        <NavItem id="discover" icon={Sparkles} label="Discover" />
                        <NavItem id="history" icon={Clock} label="Recently Played" />
                    </nav>

                    {/* Server Stats */}
                    <div className="mt-auto p-4 border-t border-white/5">
                        {!sidebarCollapsed ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 rounded-xl p-4 border border-white/5"
                            >
                                <p className="text-xs text-zinc-500 font-medium mb-3 uppercase tracking-wider">Server Info</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                                        <Users className="w-3.5 h-3.5 text-green-400" />
                                        <span>{guild.memberCount?.toLocaleString()} members</span>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex justify-center">
                                <Users className="w-5 h-5 text-zinc-600" />
                            </div>
                        )}
                    </div>

                    {/* Resize Handle */}
                    <div
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-green-500/50 transition-colors z-50 group"
                        onMouseDown={startResizing}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-green-500/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Toggle Button */}
                    <motion.div
                        className="absolute -right-3 top-8 z-50"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="h-6 w-6 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-green-500/50 shadow-lg transition-all"
                        >
                            {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                        </Button>
                    </motion.div>
                </motion.aside>

                {/* Main Content */}
                <main className="flex-1 relative overflow-hidden flex flex-col bg-gradient-to-br from-zinc-950 to-black">
                    {/* Top Bar with Glassmorphism */}
                    <header className="h-20 flex items-center justify-between px-8 z-10 bg-zinc-900/30 backdrop-blur-xl sticky top-0 border-b border-white/5 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                        <div className="relative z-10 flex items-center gap-4 flex-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setQueueOpen(true)}
                                className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            >
                                <List className="w-5 h-5" />
                            </Button>

                            <div className="flex-1 max-w-2xl">
                                <SearchBar
                                    guildId={guild.id}
                                    userId={session.user.id}
                                    channelId={guild.id}
                                />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <UserDropdown
                                session={session}
                                onSettingsClick={() => setSettingsOpen(true)}
                            />
                        </div>
                    </header>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                        <div className="max-w-7xl mx-auto py-8 space-y-8">
                            <AnimatePresence mode="wait">
                                {selectedArtist && (
                                    <motion.div
                                        key="artist"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ArtistProfile
                                            artistName={selectedArtist}
                                            guildId={guild.id}
                                            userId={session.user.id}
                                            channelId={guild.id}
                                            onBack={() => {
                                                setSelectedArtist(null)
                                                setActiveTab('discover')
                                            }}
                                        />
                                    </motion.div>
                                )}

                                {!selectedArtist && activeTab === 'discover' && (
                                    <motion.div
                                        key="discover"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Recommendations
                                            guildId={guild.id}
                                            userId={session.user.id}
                                            channelId={guild.id}
                                        />
                                    </motion.div>
                                )}

                                {!selectedArtist && activeTab === 'history' && (
                                    <motion.div
                                        key="history"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <History
                                            guildId={guild.id}
                                            userId={session.user.id}
                                            channelId={guild.id}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </main>
            </div>

            {/* Player Bar - Full Width at Bottom */}
            <div className="h-24 border-t border-white/10 relative z-30">
                <MusicPlayer
                    onArtistClick={(artistName) => {
                        setSelectedArtist(artistName)
                        setActiveTab('') // Clear active tab when showing artist
                    }}
                />
            </div>

            <QueueSidebar isOpen={queueOpen} onClose={() => setQueueOpen(false)} />
            <LyricsPanel isOpen={lyricsOpen} onClose={() => setLyricsOpen(false)} guildId={guild.id} />
            <SettingsModal
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
            />
            <KeyboardShortcutsModal
                isOpen={shortcutsOpen}
                onClose={() => setShortcutsOpen(false)}
            />
        </div>
    )
}
