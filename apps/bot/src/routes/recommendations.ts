import { FastifyPluginAsync } from 'fastify'

const recommendationsRoutes: FastifyPluginAsync = async (fastify) => {
    // Get recommendations based on current track
    fastify.get('/:guildId/similar', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }

        try {
            const player = fastify.music.players.get(guildId)

            if (!player || !player.queue.current) {
                return { recommendations: [] }
            }

            const currentTrack = player.queue.current as any

            // Search for similar tracks based on artist
            const searchQuery = `${currentTrack.author} music`
            const searchResults = await fastify.music.search(searchQuery)

            const recommendations = searchResults.tracks.slice(0, 10).map((track: any) => ({
                title: track.title,
                author: track.author,
                url: track.uri,
                duration: track.length,
                thumbnail: track.thumbnail || `https://img.youtube.com/vi/${track.identifier}/hqdefault.jpg`
            }))

            return {
                basedOn: {
                    title: currentTrack.title,
                    author: currentTrack.author
                },
                recommendations
            }
        } catch (error) {
            fastify.log.error(error)
            return { recommendations: [] }
        }
    })

    // Get trending/popular tracks
    fastify.get('/:guildId/trending', async (request, reply) => {
        try {
            // Search for popular music
            const queries = [
                'top hits 2024',
                'popular music',
                'trending songs'
            ]

            const randomQuery = queries[Math.floor(Math.random() * queries.length)]
            const searchResults = await fastify.music.search(randomQuery)

            const trending = searchResults.tracks.slice(0, 20).map((track: any) => ({
                title: track.title,
                author: track.author,
                url: track.uri,
                duration: track.length,
                thumbnail: track.thumbnail || `https://img.youtube.com/vi/${track.identifier}/hqdefault.jpg`
            }))

            return { trending }
        } catch (error) {
            fastify.log.error(error)
            return { trending: [] }
        }
    })

    // Get recommendations based on queue history
    fastify.get('/:guildId/for-you', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }

        try {
            const player = fastify.music.players.get(guildId)

            if (!player) {
                return { recommendations: [] }
            }

            // Get unique artists from queue
            const queueTracks = Array.from(player.queue as any) as any[]
            const artists = [...new Set(queueTracks.map((t: any) => t.author))].slice(0, 3)

            if (artists.length === 0) {
                return { recommendations: [] }
            }

            // Search for tracks from these artists
            const searchQuery = artists.join(' ')
            const searchResults = await fastify.music.search(searchQuery)

            const recommendations = searchResults.tracks.slice(0, 15).map((track: any) => ({
                title: track.title,
                author: track.author,
                url: track.uri,
                duration: track.length,
                thumbnail: track.thumbnail || `https://img.youtube.com/vi/${track.identifier}/hqdefault.jpg`
            }))

            return { recommendations }
        } catch (error) {
            fastify.log.error(error)
            return { recommendations: [] }
        }
    })
}

export default recommendationsRoutes
export const autoPrefix = '/recommendations'
