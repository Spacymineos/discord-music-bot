import { FastifyPluginAsync } from 'fastify'
import YouTube from 'youtube-sr'

const music: FastifyPluginAsync = async (fastify) => {
    // Play a track
    fastify.post('/:guildId/play', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }
        const body = request.body as { query: string; userId: string; textChannelId?: string }
        const { query, userId } = body

        try {
            const guild = fastify.discord.guilds.cache.get(guildId)
            if (!guild) {
                reply.code(404)
                return { error: 'Server not found. Make sure the bot is in your server.' }
            }

            const member = await guild.members.fetch(userId).catch(() => null)
            if (!member) {
                reply.code(404)
                return { error: 'User not found in server.' }
            }

            const voiceChannel = member.voice.channel
            if (!voiceChannel) {
                reply.code(400)
                return { error: 'You must be in a voice channel to play music!' }
            }

            // Create or get player
            const player = await fastify.music.createPlayer({
                guildId: guild.id,
                textId: body.textChannelId || voiceChannel.id,
                voiceId: voiceChannel.id,
                volume: 50
            })

            // Search for track
            const result = await fastify.music.search(query, { requester: { userId } })
            if (!result.tracks.length) {
                return { error: 'No results found' }
            }

            // Add to queue
            if (result.type === 'PLAYLIST') {
                for (const track of result.tracks) {
                    player.queue.add(track)
                }
            } else {
                player.queue.add(result.tracks[0])
            }

            // Start playing if not already
            if (!player.playing && !player.paused && !player.queue.size) {
                player.play()
            } else if (!player.playing && !player.paused) {
                player.play()
            }

            const track = result.tracks[0]
            return {
                success: true,
                track: {
                    title: track.title,
                    author: track.author,
                    url: track.uri,
                    duration: track.length,
                    thumbnail: track.thumbnail || `https://img.youtube.com/vi/${track.identifier}/hqdefault.jpg`
                }
            }
        } catch (error: any) {
            fastify.log.error(error)
            reply.code(500)
            return { error: error.message || 'Failed to play track' }
        }
    })

    // Get queue
    fastify.get('/:guildId/queue', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }
        const player = fastify.music.players.get(guildId)

        if (!player) {
            return { tracks: [], current: null, volume: 50, paused: false, playing: false }
        }

        const current = player.queue.current

        return {
            current: current ? {
                title: current.title,
                author: current.author,
                url: current.uri,
                duration: current.length,
                thumbnail: current.thumbnail || `https://img.youtube.com/vi/${current.identifier}/hqdefault.jpg`
            } : null,
            tracks: player.queue.map((track: any) => ({
                title: track.title,
                author: track.author,
                url: track.uri,
                duration: track.length,
                thumbnail: track.thumbnail || `https://img.youtube.com/vi/${track.identifier}/hqdefault.jpg`
            })),
            volume: player.volume,
            paused: player.paused,
            playing: player.playing,
            position: player.position || 0
        }
    })

    // Pause/Resume
    fastify.post('/:guildId/pause', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }
        const player = fastify.music.players.get(guildId)

        if (!player) {
            reply.code(404)
            return { error: 'No player found' }
        }

        player.pause(!player.paused)
        return { paused: player.paused }
    })

    // Skip
    fastify.post('/:guildId/skip', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }
        const player = fastify.music.players.get(guildId)

        if (!player) {
            reply.code(404)
            return { error: 'No player found' }
        }

        player.skip()
        return { success: true }
    })

    // Volume
    fastify.post('/:guildId/volume', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }
        const { volume } = request.body as { volume: number }
        const player = fastify.music.players.get(guildId)

        if (!player) {
            reply.code(404)
            return { error: 'No player found' }
        }

        player.setVolume(volume)
        return { volume: player.volume }
    })

    // Stop
    fastify.post('/:guildId/stop', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }
        const player = fastify.music.players.get(guildId)

        if (!player) {
            reply.code(404)
            return { error: 'No player found' }
        }

        player.destroy()
        return { success: true }
    })

    // Seek to position
    fastify.post('/:guildId/seek', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }
        const { position } = request.body as { position: number }
        const player = fastify.music.players.get(guildId)

        if (!player) {
            reply.code(404)
            return { error: 'No player found' }
        }

        player.shoukaku.seekTo(position)
        return { success: true, position }
    })

    // Get current position/timestamp
    fastify.get('/:guildId/position', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }
        const player = fastify.music.players.get(guildId)

        if (!player) {
            return { position: 0, duration: 0 }
        }

        return {
            position: player.position || 0,
            duration: (player.queue.current as any)?.length || 0,
            paused: player.paused,
            playing: player.playing
        }
    })

    // Shuffle queue
    fastify.post('/:guildId/shuffle', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }
        const player = fastify.music.players.get(guildId)

        if (!player) {
            reply.code(404)
            return { error: 'No player found' }
        }

        player.queue.shuffle()
        return { success: true }
    })

    // Toggle loop/repeat
    fastify.post('/:guildId/loop', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }
        const { mode } = request.body as { mode?: 'none' | 'track' | 'queue' }
        const player = fastify.music.players.get(guildId)

        if (!player) {
            reply.code(404)
            return { error: 'No player found' }
        }

        // Cycle through loop modes: none -> track -> queue -> none
        let newMode: 'none' | 'track' | 'queue' = mode || 'none'
        if (!mode) {
            if (!player.loop || player.loop === 'none') {
                newMode = 'track'
            } else if (player.loop === 'track') {
                newMode = 'queue'
            } else {
                newMode = 'none'
            }
        }

        player.setLoop(newMode)
        return { success: true, loop: newMode }
    })

    // Search
    fastify.get('/:guildId/search', async (request, reply) => {
        const { query } = request.query as { query: string }
        if (!query) return { error: 'Query required' }

        try {
            // Use YouTube-SR for direct YouTube search (faster and more reliable)
            const results = await YouTube.search(query, { limit: 10, type: 'video' })

            return {
                tracks: results.map((video: any) => ({
                    title: video.title,
                    author: video.channel?.name || 'Unknown',
                    url: video.url,
                    duration: video.duration || 0,
                    thumbnail: video.thumbnail?.url || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
                }))
            }
        } catch (error: any) {
            fastify.log.error(error, 'Search error')
            return { tracks: [] }
        }
    })

    // Get artist tracks
    fastify.get('/:guildId/artist/:artistName', async (request, reply) => {
        const { artistName } = request.params as { artistName: string }

        if (!artistName) {
            reply.code(400)
            return { error: 'Artist name required' }
        }

        try {
            // 1. Search for the artist's official channel first
            const channel = await YouTube.searchOne(artistName, "channel").catch(() => null)

            let artistObj = {
                name: artistName,
                image: null as string | null,
                banner: null as string | null
            }
            let tracks: any[] = []

            if (channel) {
                // Found the official channel
                artistObj.name = channel.name || artistName
                artistObj.image = channel.icon?.url || null
                artistObj.banner = (channel as any).banner?.url || null

                // 2. Fetch videos specifically for this artist
                // We search for the channel name + "official" to get their best content
                const searchName = channel.name || artistName
                const results = await YouTube.search(searchName, { limit: 30, type: 'video' })

                // 3. Filter results to ensure they are relevant to the artist
                // We check if the video author matches the channel name (fuzzy match)
                tracks = results
                    .filter((video: any) => {
                        const author = video.channel?.name?.toLowerCase() || ''
                        const target = (channel.name || '').toLowerCase()
                        return author.includes(target) || target.includes(author)
                    })
                    .slice(0, 20)
                    .map((video: any) => ({
                        title: video.title,
                        author: video.channel?.name || artistObj.name,
                        url: video.url,
                        duration: video.duration || 0,
                        thumbnail: video.thumbnail?.url || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
                    }))
            } else {
                // Fallback if no channel found
                const query = `${artistName} official`
                const results = await YouTube.search(query, { limit: 20, type: 'video' })
                tracks = results.map((video: any) => ({
                    title: video.title,
                    author: video.channel?.name || artistName,
                    url: video.url,
                    duration: video.duration || 0,
                    thumbnail: video.thumbnail?.url || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
                }))
            }

            return {
                artist: artistObj,
                tracks
            }
        } catch (error: any) {
            fastify.log.error(error, 'Artist search error')
            reply.code(500)
            return { error: 'Failed to fetch artist tracks' }
        }
    })
}

export default music
export const autoPrefix = '/music'
