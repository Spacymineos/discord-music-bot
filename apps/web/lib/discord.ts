import { Guild } from './types'

export async function getUserGuilds(accessToken: string): Promise<Guild[]> {
    const res = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    if (!res.ok) {
        throw new Error('Failed to fetch user guilds')
    }

    return res.json()
}

export function hasManagePermissions(permissions: string) {
    const MANAGE_GUILD = 0x00000020
    return (parseInt(permissions) & MANAGE_GUILD) === MANAGE_GUILD
}
