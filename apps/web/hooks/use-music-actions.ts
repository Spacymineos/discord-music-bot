import { useState } from 'react'
import { getVoiceChannels, getBotVoiceStatus, joinVoiceChannel } from '@/lib/voice-api'
import { playTrack as playTrackApi } from '@/lib/music-api'
import { showToast } from '@/components/ui/toaster'

interface UseMusicActionsProps {
    guildId: string
    userId: string
    channelId: string // This is text channel ID for commands
}

export function useMusicActions({ guildId, userId, channelId }: UseMusicActionsProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const play = async (query: string) => {
        setLoading(true)
        setError(null)
        try {
            // 1. Check voice state
            const { channels } = await getVoiceChannels(guildId)
            const userChannel = channels.find(c => c.members.some(m => m.id === userId))

            if (!userChannel) {
                const errorMsg = 'You must be in a voice channel to play music'
                showToast.error('Cannot Play', errorMsg)
                throw new Error(errorMsg)
            }

            // 2. Check bot state
            const botStatus = await getBotVoiceStatus(guildId)

            // 3. Join if needed
            // If bot is not connected OR is in a different channel, join the user's channel
            if (!botStatus.connected || botStatus.channelId !== userChannel.id) {
                await joinVoiceChannel(guildId, userChannel.id)
                showToast.info('Joined Voice Channel', `Connected to ${userChannel.name}`)
            }

            // 4. Play
            await playTrackApi(guildId, query, userId, channelId)
            showToast.success('Track Added', 'Your track has been added to the queue')

        } catch (err: unknown) {
            console.error('Play failed:', err)
            const errorMsg = err instanceof Error ? err.message : 'Failed to play track'
            setError(errorMsg)

            // Only show error toast if not already shown
            if (!(err instanceof Error) || !err.message?.includes('voice channel')) {
                showToast.error('Playback Error', errorMsg)
            }
            throw err
        } finally {
            setLoading(false)
        }
    }

    return { play, loading, error }
}
