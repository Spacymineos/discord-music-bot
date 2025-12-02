import { Guild } from './types'

const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:3001'

export async function getGuilds(): Promise<Guild[]> {
    const res = await fetch(`${BOT_API_URL}/guilds`, {
        cache: 'no-store',
    })

    if (!res.ok) throw new Error('Failed to fetch guilds')
    return res.json()
}

export async function getGuild(id: string): Promise<Guild> {
    const res = await fetch(`${BOT_API_URL}/guilds/${id}`, {
        cache: 'no-store',
    })

    if (!res.ok) throw new Error('Failed to fetch guild')
    return res.json()
}

export async function getGuildSettings(id: string): Promise<Record<string, unknown>> {
    const res = await fetch(`${BOT_API_URL}/guilds/${id}/settings`, {
        cache: 'no-store',
    })

    if (!res.ok) throw new Error('Failed to fetch settings')
    return res.json()
}

export async function updateGuildSettings(id: string, settings: Record<string, unknown>) {
    const res = await fetch(`${BOT_API_URL}/guilds/${id}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
    })

    if (!res.ok) throw new Error('Failed to update settings')
    return res.json()
}
