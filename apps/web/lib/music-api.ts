const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:3001'

export interface Track {
    title: string
    author: string
    url: string
    duration: number
    thumbnail: string | null
}

export interface QueueResponse {
    current: Track | null
    tracks: Track[]
    volume: number
    paused: boolean
    playing: boolean
    position?: number
}

// Music controls
export async function playTrack(guildId: string, query: string, userId: string, channelId: string) {
    const res = await fetch(`${BOT_API_URL}/music/${guildId}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, userId, channelId })
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to play track' }))
        throw new Error(errorData.error || 'Failed to play track')
    }

    return res.json()
}


export async function getQueue(guildId: string): Promise<QueueResponse> {
    const res = await fetch(`${BOT_API_URL}/music/${guildId}/queue`, {
        cache: 'no-store'
    })
    if (!res.ok) throw new Error('Failed to fetch queue')
    return res.json()
}


export async function togglePause(guildId: string) {
    const res = await fetch(`${BOT_API_URL}/music/${guildId}/pause`, {
        method: 'POST'
    })
    if (!res.ok) throw new Error('Failed to toggle pause')
    return res.json()
}


export async function skipTrack(guildId: string) {
    const res = await fetch(`${BOT_API_URL}/music/${guildId}/skip`, {
        method: 'POST'
    })
    if (!res.ok) throw new Error('Failed to skip')
    return res.json()
}


export async function setVolume(guildId: string, volume: number) {
    const res = await fetch(`${BOT_API_URL}/music/${guildId}/volume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume })
    })
    if (!res.ok) throw new Error('Failed to set volume')
    return res.json()
}


export async function seekToPosition(guildId: string, position: number) {
    const res = await fetch(`${BOT_API_URL}/music/${guildId}/seek`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position })
    })
    if (!res.ok) throw new Error('Failed to seek')
    return res.json()
}


export async function stopPlayback(guildId: string) {
    const res = await fetch(`${BOT_API_URL}/music/${guildId}/stop`, {
        method: 'POST'
    })
    if (!res.ok) throw new Error('Failed to stop')
    return res.json()
}


export async function searchTracks(guildId: string, query: string) {
    const url = `${BOT_API_URL}/music/${guildId}/search?query=${encodeURIComponent(query)}`

    try {
        const res = await fetch(url, {
            cache: 'no-store'
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Failed to search' }))
            const errorMessage = errorData.error || `Failed to search (${res.status}: ${res.statusText})`
            throw new Error(errorMessage)
        }

        return res.json()
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error(`Failed to connect to bot API at ${BOT_API_URL}. Make sure the bot server is running.`)
    }
}


// Playlists
export async function getPlaylists(guildId: string, userId?: string) {
    const url = userId
        ? `${BOT_API_URL}/playlists/${guildId}/playlists?userId=${userId}`
        : `${BOT_API_URL}/playlists/${guildId}/playlists`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch playlists')
    return res.json()
}


export async function createPlaylist(guildId: string, name: string, userId: string) {
    const res = await fetch(`${BOT_API_URL}/playlists/${guildId}/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, userId })
    })
    if (!res.ok) throw new Error('Failed to create playlist')
    return res.json()
}


// Rooms
export async function getRooms(guildId: string) {
    const res = await fetch(`${BOT_API_URL}/rooms/${guildId}`, {
        cache: 'no-store'
    })
    if (!res.ok) throw new Error('Failed to fetch rooms')
    return res.json()
}


export async function createRoom(guildId: string, data: {
    name: string
    ownerId: string
    isPublic?: boolean
    maxListeners?: number
}) {
    const res = await fetch(`${BOT_API_URL}/rooms/${guildId}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to create room')
    return res.json()
}


export async function deleteRoom(guildId: string, roomId: string) {
    const res = await fetch(`${BOT_API_URL}/rooms/${guildId}/${roomId}`, {
        method: 'DELETE'
    })
    if (!res.ok) throw new Error('Failed to delete room')
    return res.json()
}


export async function deletePlaylist(guildId: string, playlistId: string) {
    const res = await fetch(`${BOT_API_URL}/playlists/${guildId}/playlists/${playlistId}`, {
        method: 'DELETE'
    })
    if (!res.ok) throw new Error('Failed to delete playlist')
    return res.json()
}


export interface TrackInput {
    title: string
    artist: string
    url: string
    duration: number
    thumbnail?: string
    addedBy: string
}

export async function addTrackToPlaylist(guildId: string, playlistId: string, track: TrackInput) {
    const res = await fetch(`${BOT_API_URL}/playlists/${guildId}/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(track)
    })
    if (!res.ok) throw new Error('Failed to add track to playlist')
    return res.json()
}


export async function removeTrackFromPlaylist(guildId: string, playlistId: string, trackId: string) {
    const res = await fetch(`${BOT_API_URL}/playlists/${guildId}/playlists/${playlistId}/tracks/${trackId}`, {
        method: 'DELETE'
    })
    if (!res.ok) throw new Error('Failed to remove track from playlist')
    return res.json()
}


export async function toggleLike(guildId: string, userId: string, track: Track) {
    const res = await fetch(`${BOT_API_URL}/playlists/${guildId}/likes/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, track })
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to toggle like' }))
        const errorMessage = errorData.details
            ? `Failed to toggle like: ${errorData.details}`
            : errorData.error || 'Failed to toggle like'
        throw new Error(errorMessage)
    }

    return res.json()
}


export async function getLikedSongs(guildId: string, userId: string) {
    try {
        const res = await fetch(`${BOT_API_URL}/playlists/${guildId}/likes?userId=${userId}`, {
            cache: 'no-store'
        })
        if (!res.ok) return { tracks: [] }
        return res.json()
    } catch (error) {
        console.error('Failed to fetch liked songs:', error)
        return { tracks: [] }
    }
}

export async function getLyrics(guildId: string, query: string) {
    const res = await fetch(`${BOT_API_URL}/lyrics/${guildId}/search?query=${encodeURIComponent(query)}`, {
        cache: 'no-store'
    })
    if (!res.ok) throw new Error('Failed to fetch lyrics')
    return res.json()
}

export async function getHistory(guildId: string, userId: string) {
    const res = await fetch(`${BOT_API_URL}/history/${guildId}?userId=${userId}`, {
        cache: 'no-store'
    })
    if (!res.ok) throw new Error('Failed to fetch history')
    return res.json()
}

export async function shuffleQueue(guildId: string) {
    const res = await fetch(`${BOT_API_URL}/music/${guildId}/shuffle`, {
        method: 'POST'
    })
    if (!res.ok) throw new Error('Failed to shuffle')
    return res.json()
}

export async function toggleLoop(guildId: string, mode?: 'none' | 'track' | 'queue') {
    const res = await fetch(`${BOT_API_URL}/music/${guildId}/loop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
    })
    if (!res.ok) throw new Error('Failed to toggle loop')
    return res.json()
}

export async function getArtistTracks(guildId: string, artistName: string) {
    const res = await fetch(`${BOT_API_URL}/music/${guildId}/artist/${encodeURIComponent(artistName)}`, {
        cache: 'no-store'
    })
    if (!res.ok) throw new Error('Failed to fetch artist tracks')
    return res.json()
}

