'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, Users, Radio, LogOut } from 'lucide-react'
import { Button } from './ui/button'
import { getBotVoiceStatus, getVoiceChannels, leaveVoiceChannel } from '@/lib/voice-api'
import type { BotVoiceStatus, VoiceChannel } from '@/lib/voice-api'
import Image from 'next/image'

interface VoiceStatusProps {
    guildId: string
}

export default function VoiceStatus({ guildId }: VoiceStatusProps) {
    const [botStatus, setBotStatus] = useState<BotVoiceStatus | null>(null)
    const [channels, setChannels] = useState<VoiceChannel[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function fetchData() {
            try {
                const [status, channelsData] = await Promise.all([
                    getBotVoiceStatus(guildId),
                    getVoiceChannels(guildId)
                ])
                setBotStatus(status)
                setChannels(channelsData.channels)
            } catch (error) {
                console.error('Failed to fetch voice data:', error)
            }
        }

        fetchData()
        const interval = setInterval(fetchData, 5000)
        return () => clearInterval(interval)
    }, [guildId])

    const handleLeaveChannel = async () => {
        setLoading(true)
        try {
            await leaveVoiceChannel(guildId)
            const status = await getBotVoiceStatus(guildId)
            setBotStatus(status)
        } catch (error) {
            console.error('Failed to leave channel:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Bot Status Card */}
            {botStatus?.connected && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Radio className="w-5 h-5 text-green-400 animate-pulse" />
                            </div>
                            <div>
                                <p className="font-bold text-white">Bot Connected</p>
                                <p className="text-sm text-zinc-400">{botStatus.channelName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-sm text-zinc-400">
                                <Users className="w-4 h-4" />
                                <span>{botStatus.memberCount}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLeaveChannel}
                                disabled={loading}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Leave
                            </Button>
                        </div>
                    </div>

                    {/* Members in voice */}
                    {botStatus.members.length > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                            <p className="text-xs text-zinc-500">Listening:</p>
                            <div className="flex -space-x-2">
                                {botStatus.members.slice(0, 5).map((member) => (
                                    <Image
                                        key={member.id}
                                        src={member.avatar}
                                        alt={member.username}
                                        width={24}
                                        height={24}
                                        className="w-6 h-6 rounded-full ring-2 ring-zinc-900"
                                    />
                                ))}
                                {botStatus.members.length > 5 && (
                                    <div className="w-6 h-6 rounded-full bg-zinc-800 ring-2 ring-zinc-900 flex items-center justify-center text-xs">
                                        +{botStatus.members.length - 5}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Auto-join info when bot is not connected */}
            {!botStatus?.connected && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <Mic className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <p className="font-medium text-white text-sm">Auto Voice Join</p>
                            <p className="text-xs text-zinc-400 mt-1">
                                Join a voice channel, then play any song. The bot will automatically join your channel!
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Voice Channels List - Display Only */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Voice Channels</h3>
                {channels.map((channel) => {
                    const isBotHere = botStatus?.channelId === channel.id

                    return (
                        <motion.div
                            key={channel.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-3 rounded-lg transition-all ${isBotHere
                                    ? 'bg-green-500/10 border border-green-500/20'
                                    : 'bg-white/5 border border-transparent'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Mic className={`w-4 h-4 ${isBotHere ? 'text-green-400' : 'text-zinc-500'}`} />
                                    <div>
                                        <p className="font-medium text-sm text-white">{channel.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                <Users className="w-3 h-3" />
                                                <span>{channel.memberCount}</span>
                                            </div>
                                            {isBotHere && (
                                                <span className="text-xs text-green-400">● Active</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {channel.members.length > 0 && (
                                    <div className="flex -space-x-2">
                                        {channel.members.slice(0, 3).map((member) => (
                                            <div
                                                key={member.id}
                                                className="relative"
                                                title={member.username}
                                            >
                                                <Image
                                                    src={member.avatar}
                                                    alt={member.username}
                                                    width={20}
                                                    height={20}
                                                    className="w-5 h-5 rounded-full ring-2 ring-zinc-900"
                                                />
                                                {member.bot && (
                                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border border-zinc-900 flex items-center justify-center">
                                                        <span className="text-[8px] text-white font-bold">B</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )
                })}

                {channels.length === 0 && (
                    <p className="text-sm text-zinc-500 text-center py-4">No voice channels available</p>
                )}
            </div>
        </div>
    )
}
