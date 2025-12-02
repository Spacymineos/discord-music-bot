import { FastifyPluginAsync } from 'fastify'

const history: FastifyPluginAsync = async (fastify) => {
    fastify.get('/:guildId', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }
        const { userId } = request.query as { userId: string }

        if (!userId) {
            reply.code(400)
            return { error: 'User ID is required' }
        }

        try {
            // Fetch recent history
            const recentHistory = await fastify.prisma.history.findMany({
                where: {
                    guildId,
                    userId
                },
                orderBy: {
                    playedAt: 'desc'
                },
                take: 50
            })

            // "Smart" algorithm: Most played tracks in the last 30 days
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const topTracks = await fastify.prisma.history.groupBy({
                by: ['trackUrl', 'trackTitle', 'trackAuthor', 'trackThumbnail'],
                where: {
                    guildId,
                    userId,
                    playedAt: {
                        gte: thirtyDaysAgo
                    }
                },
                _count: {
                    trackUrl: true
                },
                orderBy: {
                    _count: {
                        trackUrl: 'desc'
                    }
                },
                take: 10
            })

            return {
                recent: recentHistory.map((h: any) => ({
                    id: h.id,
                    title: h.trackTitle,
                    artist: h.trackAuthor,
                    url: h.trackUrl,
                    thumbnail: h.trackThumbnail,
                    playedAt: h.playedAt
                })),
                top: topTracks.map((t: any) => ({
                    title: t.trackTitle,
                    artist: t.trackAuthor,
                    url: t.trackUrl,
                    thumbnail: t.trackThumbnail,
                    playCount: t._count.trackUrl
                }))
            }
        } catch (error) {
            fastify.log.error(error)
            return { recent: [], top: [] }
        }
    })
}

export default history
export const autoPrefix = '/history'
