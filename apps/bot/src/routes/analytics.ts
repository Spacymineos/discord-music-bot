import { FastifyPluginAsync } from 'fastify'

const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
    // Get listening history and stats
    fastify.get('/:guildId/stats', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }

        try {
            const player = fastify.music.players.get(guildId)

            // Get basic stats
            const current = player?.queue.current
            const queue = player?.queue ? Array.from(player.queue as any) : []

            const stats = {
                currentlyPlaying: current ? {
                    title: (current as any).title,
                    author: (current as any).author,
                    duration: (current as any).length,
                    thumbnail: (current as any).thumbnail || `https://img.youtube.com/vi/${(current as any).identifier}/hqdefault.jpg`
                } : null,
                queueSize: queue.length,
                totalDuration: queue.reduce((acc: number, track: any) => acc + (track.length || 0), 0),
                isPlaying: player?.playing || false,
                isPaused: player?.paused || false,
                volume: player?.volume || 100,
                repeatMode: 0,
                timestamp: {
                    current: { value: player?.position || 0 },
                    total: { value: (current as any)?.length || 0 }
                }
            }

            return stats
        } catch (error) {
            fastify.log.error(error)
            return reply.code(500).send({ error: 'Failed to get stats' })
        }
    })

    // Get recently played tracks (from queue history)
    fastify.get('/:guildId/history', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }

        try {
            const player = fastify.music.players.get(guildId)

            if (!player) {
                return { history: [] }
            }

            // Get tracks from history
            const previousTracks = (player.queue.previous || []) as any[]
            const history = previousTracks.slice(0, 50).map((track: any) => ({
                title: track.title,
                author: track.author,
                url: track.uri,
                duration: track.length,
                thumbnail: track.thumbnail || `https://img.youtube.com/vi/${track.identifier}/hqdefault.jpg`,
                playedAt: new Date().toISOString()
            }))

            return { history }
        } catch (error) {
            fastify.log.error(error)
            return { history: [] }
        }
    })

    // Get top artists/tracks (based on queue history)
    fastify.get('/:guildId/top', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }
        const { type = 'artists' } = request.query as { type?: 'artists' | 'tracks' }

        try {
            const player = fastify.music.players.get(guildId)

            if (!player) {
                return { top: [] }
            }

            const tracks = ((player.queue.previous || []) as any[])

            if (type === 'artists') {
                // Count plays per artist
                const artistCounts: Record<string, number> = {}
                tracks.forEach((track: any) => {
                    const artist = track.author || 'Unknown'
                    artistCounts[artist] = (artistCounts[artist] || 0) + 1
                })

                const topArtists = Object.entries(artistCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([artist, plays]) => ({ artist, plays }))

                return { top: topArtists }
            } else {
                // Count plays per track
                const trackCounts: Record<string, { track: any, count: number }> = {}
                tracks.forEach((track: any) => {
                    const key = `${track.title}|${track.author}`
                    if (!trackCounts[key]) {
                        trackCounts[key] = { track, count: 0 }
                    }
                    trackCounts[key].count++
                })

                const topTracks = Object.values(trackCounts)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
                    .map(({ track, count }) => ({
                        title: track.title,
                        author: track.author,
                        url: track.uri,
                        thumbnail: track.thumbnail || `https://img.youtube.com/vi/${track.identifier}/hqdefault.jpg`,
                        plays: count
                    }))

                return { top: topTracks }
            }
        } catch (error) {
            fastify.log.error(error)
            return { top: [] }
        }
    })
}

export default analyticsRoutes
export const autoPrefix = '/analytics'
