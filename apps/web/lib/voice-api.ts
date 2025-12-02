const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:3001'

export interface VoiceChannel {
    id: string
    name: string
    memberCount: number
    members: {
        id: string
        username: string
        avatar: string
        bot: boolean
    }[]
}

export interface BotVoiceStatus {
    connected: boolean
    channelId: string | null
    channelName: string | null
    channelType: number | null
    memberCount: number
    members: {
        id: string
        username: string
        avatar: string
    }[]
}

export async function getBotVoiceStatus(guildId: string): Promise<BotVoiceStatus> {
    const res = await fetch(`${BOT_API_URL}/voice/${guildId}/status`, {
        cache: 'no-store'
    })
    if (!res.ok) throw new Error('Failed to get bot voice status')
    return res.json()
}

export async function getVoiceChannels(guildId: string): Promise<{ channels: VoiceChannel[] }> {
    const res = await fetch(`${BOT_API_URL}/voice/${guildId}/channels`, {
        cache: 'no-store'
    })
    if (!res.ok) throw new Error('Failed to get voice channels')
    return res.json()
}

export async function joinVoiceChannel(guildId: string, channelId: string) {
    const res = await fetch(`${BOT_API_URL}/voice/${guildId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId })
    })
    if (!res.ok) throw new Error('Failed to join voice channel')
    return res.json()
}

export async function leaveVoiceChannel(guildId: string) {
    const res = await fetch(`${BOT_API_URL}/voice/${guildId}/leave`, {
        method: 'POST'
    })
    if (!res.ok) throw new Error('Failed to leave voice channel')
    return res.json()
}

export async function getSimilarTracks(guildId: string) {
    const res = await fetch(`${BOT_API_URL}/recommendations/${guildId}/similar`, {
        cache: 'no-store'
    })
    if (!res.ok) throw new Error('Failed to get similar tracks')
    return res.json()
}

export async function getTrendingTracks(guildId: string) {
    const res = await fetch(`${BOT_API_URL}/recommendations/${guildId}/trending`, {
        cache: 'no-store'
    })
    if (!res.ok) throw new Error('Failed to get trending tracks')
    return res.json()
}

export async function getPersonalizedRecommendations(guildId: string) {
    const res = await fetch(`${BOT_API_URL}/recommendations/${guildId}/for-you`, {
        cache: 'no-store'
    })
    if (!res.ok) throw new Error('Failed to get personalized recommendations')
    return res.json()
}
