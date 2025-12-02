import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

const artistRoutes: FastifyPluginAsync = async (fastify) => {
    // Get tracks by artist
    fastify.get('/:artist/tracks', async (request, reply) => {
        const { artist } = request.params as { artist: string }
        const decodedArtist = decodeURIComponent(artist)

        try {
            // Find tracks by artist in all playlists
            const tracks = await (fastify as any).prisma.track.findMany({
                where: {
                    artist: {
                        contains: decodedArtist,
                        mode: 'insensitive'
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 50
            })

            // Remove duplicates based on URL
            const uniqueTracks = tracks.filter((track: any, index: number, self: any[]) =>
                index === self.findIndex((t: any) => t.url === track.url)
            )

            return {
                artist: decodedArtist,
                tracks: uniqueTracks
            }
        } catch (error) {
            fastify.log.error(error)
            reply.code(500).send({ error: 'Failed to fetch artist tracks' })
        }
    })
}

export default fp(artistRoutes)
