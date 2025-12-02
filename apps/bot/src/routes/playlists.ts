import { FastifyPluginAsync } from 'fastify'
import { prisma } from '@repo/database'

const playlists: FastifyPluginAsync = async (fastify) => {
    // Create playlist
    fastify.post('/:guildId/playlists', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }
        const { name, userId } = request.body as { name: string; userId: string }

        const playlist = await prisma.playlist.create({
            data: {
                name,
                guildId,
                userId
            }
        })

        return {
            id: playlist.id,
            name: playlist.name,
            userId: playlist.userId,
            createdAt: playlist.createdAt
        }
    })

    // Get all playlists for a guild
    fastify.get('/:guildId/playlists', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }
        const { userId } = request.query as { userId?: string }

        try {
            const playlists = await prisma.playlist.findMany({
                where: {
                    guildId,
                    ...(userId && { userId })
                },
                include: {
                    tracks: {
                        orderBy: { position: 'asc' }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })

            return playlists.map((playlist: any) => ({
                id: playlist.id,
                name: playlist.name,
                userId: playlist.userId,
                trackCount: playlist.tracks.length,
                createdAt: playlist.createdAt
            }))
        } catch (error) {
            fastify.log.error(error)
            reply.code(500)
            return { error: 'Failed to fetch playlists. Database may not be initialized.' }
        }
    })

    // Get playlist with tracks
    fastify.get('/:guildId/playlists/:playlistId', async (request, reply) => {
        const { playlistId } = request.params as { playlistId: string }

        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId },
            include: {
                tracks: {
                    orderBy: { position: 'asc' }
                }
            }
        })

        if (!playlist) {
            reply.code(404)
            return { error: 'Playlist not found' }
        }

        return {
            id: playlist.id,
            name: playlist.name,
            userId: playlist.userId,
            tracks: playlist.tracks.map((track: any) => ({
                id: track.id,
                title: track.title,
                artist: track.artist,
                url: track.url,
                duration: track.duration,
                thumbnail: track.thumbnail,
                addedBy: track.addedBy
            })),
            createdAt: playlist.createdAt
        }
    })

    // Add track to playlist
    fastify.post('/:guildId/playlists/:playlistId/tracks', async (request, reply) => {
        const { playlistId } = request.params as { playlistId: string }
        const { title, artist, url, duration, thumbnail, addedBy } = request.body as {
            title: string
            artist: string
            url: string
            duration: number
            thumbnail?: string
            addedBy: string
        }

        // Get current max position
        const lastTrack = await prisma.track.findFirst({
            where: { playlistId },
            orderBy: { position: 'desc' }
        })

        const track = await prisma.track.create({
            data: {
                title,
                artist,
                url,
                duration,
                thumbnail,
                addedBy,
                playlistId,
                position: (lastTrack?.position ?? -1) + 1
            }
        })

        return {
            id: track.id,
            title: track.title,
            artist: track.artist,
            url: track.url,
            duration: track.duration,
            thumbnail: track.thumbnail
        }
    })

    // Remove track from playlist
    fastify.delete('/:guildId/playlists/:playlistId/tracks/:trackId', async (request, reply) => {
        const { trackId } = request.params as { trackId: string }

        await prisma.track.delete({
            where: { id: trackId }
        })

        return { success: true }
    })

    // Toggle Like (Add/Remove from Liked Songs playlist)
    fastify.post('/:guildId/likes/toggle', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }
        const { userId, track } = request.body as {
            userId: string,
            track: {
                title: string,
                author: string,
                url: string,
                duration: number,
                thumbnail?: string
            }
        }

        try {
            // Find or create "Liked Songs" playlist
            let playlist = await prisma.playlist.findFirst({
                where: {
                    guildId,
                    userId,
                    name: 'Liked Songs'
                }
            })

            if (!playlist) {
                playlist = await prisma.playlist.create({
                    data: {
                        name: 'Liked Songs',
                        guildId,
                        userId
                    }
                })
            }

            // Check if track exists
            const existingTrack = await prisma.track.findFirst({
                where: {
                    playlistId: playlist.id,
                    url: track.url
                }
            })

            if (existingTrack) {
                // Unlike: Remove track
                await prisma.track.delete({
                    where: { id: existingTrack.id }
                })
                return { liked: false, message: 'Track removed from liked songs' }
            } else {
                // Like: Add track
                const lastTrack = await prisma.track.findFirst({
                    where: { playlistId: playlist.id },
                    orderBy: { position: 'desc' }
                })

                await prisma.track.create({
                    data: {
                        title: track.title,
                        artist: track.author,
                        url: track.url,
                        duration: track.duration,
                        thumbnail: track.thumbnail,
                        addedBy: userId,
                        playlistId: playlist.id,
                        position: (lastTrack?.position ?? -1) + 1
                    }
                })
                return { liked: true, message: 'Track added to liked songs' }
            }
        } catch (error) {
            fastify.log.error({ error, guildId, userId, track: track.url }, 'Failed to toggle like')
            reply.code(500)
            return {
                error: 'Failed to toggle like',
                details: error instanceof Error ? error.message : 'Unknown error',
                hint: 'Check if database is connected and Prisma is properly initialized'
            }
        }
    })

    // Get Liked Songs
    fastify.get('/:guildId/likes', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }
        const { userId } = request.query as { userId: string }

        const playlist = await prisma.playlist.findFirst({
            where: {
                guildId,
                userId,
                name: 'Liked Songs'
            },
            include: {
                tracks: {
                    orderBy: { createdAt: 'desc' } // Most recently liked first
                }
            }
        })

        if (!playlist) {
            return { tracks: [] }
        }

        return {
            tracks: playlist.tracks.map((track: any) => ({
                id: track.id,
                title: track.title,
                artist: track.artist,
                url: track.url,
                duration: track.duration,
                thumbnail: track.thumbnail,
                addedBy: track.addedBy
            }))
        }
    })

    // Delete playlist
    fastify.delete('/:guildId/playlists/:playlistId', async (request, reply) => {
        const { playlistId } = request.params as { playlistId: string }

        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId }
        })

        if (!playlist) {
            reply.code(404)
            return { error: 'Playlist not found' }
        }

        if (playlist.name === 'Liked Songs') {
            reply.code(403)
            return { error: 'Cannot delete "Liked Songs" playlist' }
        }

        await prisma.playlist.delete({
            where: { id: playlistId }
        })

        return { success: true }
    })

    // Reorder tracks in playlist
    fastify.patch('/:guildId/playlists/:playlistId/reorder', async (request, reply) => {
        const { trackIds } = request.body as { trackIds: string[] }

        // Update positions
        await Promise.all(
            trackIds.map((trackId, index) =>
                prisma.track.update({
                    where: { id: trackId },
                    data: { position: index }
                })
            )
        )

        return { success: true }
    })
}

export default playlists
export const autoPrefix = '/playlists'
