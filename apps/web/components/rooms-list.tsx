'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Users, Mic, Volume2 } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { getRooms, createRoom, deleteRoom } from '@/lib/music-api'
import { format } from 'date-fns'

interface RoomsListProps {
    guildId: string
    userId: string
}

interface Room {
    id: string
    name: string
    ownerId: string
    isPublic: boolean
    maxListeners: number
    createdAt: string
}

export default function RoomsList({ guildId, userId }: RoomsListProps) {
    const [rooms, setRooms] = useState<Room[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [newRoomName, setNewRoomName] = useState('')
    const [loading, setLoading] = useState(false)

    const fetchRooms = useCallback(async () => {
        try {
            const data = await getRooms(guildId)
            setRooms(data)
        } catch (error) {
            console.error('Failed to fetch rooms:', error)
        }
    }, [guildId])

    useEffect(() => {
        fetchRooms()
        const interval = setInterval(fetchRooms, 10000)
        return () => clearInterval(interval)
    }, [fetchRooms])

    const handleCreateRoom = async () => {
        if (!newRoomName.trim()) return

        setLoading(true)
        try {
            await createRoom(guildId, {
                name: newRoomName,
                ownerId: userId,
                isPublic: true,
                maxListeners: 0
            })
            setNewRoomName('')
            setIsCreating(false)
            fetchRooms()
        } catch (error) {
            console.error('Failed to create room:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteRoom = async (roomId: string) => {
        if (!confirm('Are you sure you want to delete this room?')) return

        try {
            await deleteRoom(guildId, roomId)
            fetchRooms()
        } catch (error) {
            console.error('Failed to delete room:', error)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Mic className="w-5 h-5 text-indigo-400" />
                    Listening Rooms
                </h2>
                <Button
                    size="sm"
                    onClick={() => setIsCreating(!isCreating)}
                    variant={isCreating ? "secondary" : "primary"}
                >
                    {isCreating ? 'Cancel' : 'Create Room'}
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
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                placeholder="Room Name (e.g. Chill Vibes)"
                                className="bg-zinc-950 border-zinc-800"
                            />
                            <Button onClick={handleCreateRoom} disabled={loading}>
                                {loading ? 'Creating...' : 'Create'}
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.map((room) => (
                    <div key={room.id} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 border border-white/5 hover:border-white/10">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                    <Volume2 className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{room.name}</h3>
                                    <p className="text-xs text-zinc-400">
                                        Created {format(new Date(room.createdAt), 'MMM d, yyyy')}
                                    </p>
                                </div>
                            </div>
                            {room.ownerId === userId && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                                    onClick={() => handleDeleteRoom(room.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-sm text-zinc-400">
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{room.maxListeners === 0 ? 'Unlimited' : room.maxListeners} Listeners</span>
                            </div>
                            <div className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-zinc-300">
                                {room.isPublic ? 'Public' : 'Private'}
                            </div>
                        </div>
                    </div>
                ))}

                {rooms.length === 0 && !isCreating && (
                    <div className="col-span-full text-center py-8 text-zinc-500">
                        <p>No active listening rooms</p>
                    </div>
                )}
            </div>
        </div>
    )
}
