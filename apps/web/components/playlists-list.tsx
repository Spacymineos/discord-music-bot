'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Trash2, ListMusic, Play, Heart, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { getPlaylists, createPlaylist, deletePlaylist } from '@/lib/music-api'
import { format } from 'date-fns'
import { useMusicActions } from '@/hooks/use-music-actions'

interface PlaylistsListProps {
    guildId: string
    userId: string
    channelId: string
    onViewLikedSongs?: () => void
}

interface Playlist {
    id: string
    name: string
    userId: string
    trackCount: number
    createdAt: string
}

export default function PlaylistsList({ guildId, userId, channelId, onViewLikedSongs }: PlaylistsListProps) {
    const [playlists, setPlaylists] = useState<Playlist[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [newPlaylistName, setNewPlaylistName] = useState('')
    const [loading, setLoading] = useState(false)

    const { play } = useMusicActions({ guildId, userId, channelId })

    const fetchPlaylists = useCallback(async () => {
        try {
            const data = await getPlaylists(guildId, userId)
            setPlaylists(data)
        } catch (error) {
            console.error('Failed to fetch playlists:', error)
        }
    }, [guildId, userId])

    useEffect(() => {
        fetchPlaylists()
    }, [fetchPlaylists])

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return

        setLoading(true)
        try {
            await createPlaylist(guildId, newPlaylistName, userId)
            setNewPlaylistName('')
            setIsCreating(false)
            fetchPlaylists()
        } catch (error) {
            console.error('Failed to create playlist:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeletePlaylist = async (playlistId: string) => {
        if (!confirm('Are you sure you want to delete this playlist?')) return

        try {
            await deletePlaylist(guildId, playlistId)
            fetchPlaylists()
        } catch (error) {
            console.error('Failed to delete playlist:', error)
        }
    }

    const handlePlayPlaylist = async (playlist: Playlist) => {
        try {
            await play(playlist.name)
        } catch (error) {
            console.error('Failed to play playlist:', error)
        }
    }

    const likedSongs = playlists.find(p => p.name === 'Liked Songs')
    const userPlaylists = playlists.filter(p => p.name !== 'Liked Songs')

    return (
        <div className="space-y-8">
            {/* Liked Songs Card */}
            {likedSongs && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8"
                    onClick={() => onViewLikedSongs ? onViewLikedSongs() : handlePlayPlaylist(likedSongs)}
                >
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                    <div className="relative z-10 flex items-end justify-between">
                        <div>
                            <div className="mb-4 inline-flex p-3 rounded-full bg-white/20 backdrop-blur-sm">
                                <Heart className="w-8 h-8 text-white fill-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Liked Songs</h2>
                            <p className="text-white/80 font-medium">{likedSongs.trackCount} songs</p>
                        </div>
                        <Button
                            size="icon"
                            className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 text-black shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                            onClick={(e) => {
                                e.stopPropagation()
                                handlePlayPlaylist(likedSongs)
                            }}
                        >
                            <Play className="w-6 h-6 fill-current ml-1" />
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Custom Playlists */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ListMusic className="w-5 h-5 text-zinc-400" />
                        Your Playlists
                    </h2>
                    <Button
                        size="sm"
                        onClick={() => setIsCreating(!isCreating)}
                        className="bg-white text-black hover:bg-zinc-200"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Playlist
                    </Button>
                </div>

                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="overflow-hidden"
                    >
                        <Card className="p-4 bg-zinc-900/50 border-zinc-800">
                            <div className="flex gap-2">
                                <Input
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    placeholder="Playlist Name"
                                    className="bg-zinc-950 border-zinc-800"
                                />
                                <Button onClick={handleCreatePlaylist} disabled={loading}>
                                    {loading ? 'Creating...' : 'Create'}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {userPlaylists.map((playlist) => (
                        <div key={playlist.id} className="p-4 bg-zinc-900/50 hover:bg-zinc-800 rounded-xl transition-all duration-200 group relative overflow-hidden cursor-pointer border border-white/5 hover:border-white/10">
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                                        <ListMusic className="w-6 h-6 text-zinc-400" />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handlePlayPlaylist(playlist)
                                            }}
                                        >
                                            <Play className="w-4 h-4 fill-current" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeletePlaylist(playlist.id)
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <h3 className="font-bold truncate text-white">{playlist.name}</h3>
                                <p className="text-xs text-zinc-400 mt-1">
                                    {playlist.trackCount} tracks • {format(new Date(playlist.createdAt), 'MMM d')}
                                </p>
                            </div>
                        </div>
                    ))}

                    {userPlaylists.length === 0 && !isCreating && (
                        <div className="col-span-full text-center py-12 border border-dashed border-zinc-800 rounded-xl">
                            <ListMusic className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-500">No playlists yet</p>
                            <Button variant="ghost" onClick={() => setIsCreating(true)} className="text-green-500 hover:text-green-400">
                                Create one now
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
