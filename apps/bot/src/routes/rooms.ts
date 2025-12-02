import { FastifyPluginAsync } from 'fastify'
import { prisma } from '@repo/database'
import { ChannelType, PermissionFlagsBits } from 'discord.js'

const rooms: FastifyPluginAsync = async (fastify) => {
    // Create a new listening room
    fastify.post('/:guildId/create', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }
        const { name, ownerId, isPublic, maxListeners } = request.body as {
            name: string
            ownerId: string
            isPublic?: boolean
            maxListeners?: number
        }

        const guild = fastify.discord.guilds.cache.get(guildId)
        if (!guild) {
            reply.code(404)
            return { error: 'Guild not found' }
        }

        try {
            // Create voice channel
            const voiceChannel = await guild.channels.create({
                name: `🎵 ${name}`,
                type: ChannelType.GuildVoice,
                userLimit: maxListeners || 0,
                permissionOverwrites: isPublic ? [] : [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.Connect]
                    },
                    {
                        id: ownerId,
                        allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
                    }
                ]
            })

            // Create text channel for the room
            const textChannel = await guild.channels.create({
                name: `💬-${name.toLowerCase().replace(/\s+/g, '-')}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: ownerId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    }
                ]
            })

            // Save room to database
            const room = await prisma.room.create({
                data: {
                    name,
                    guildId,
                    voiceChannelId: voiceChannel.id,
                    textChannelId: textChannel.id,
                    ownerId,
                    isPublic: isPublic ?? true,
                    maxListeners: maxListeners || 0
                }
            })

            return {
                id: room.id,
                name: room.name,
                voiceChannelId: room.voiceChannelId,
                textChannelId: room.textChannelId,
                ownerId: room.ownerId,
                isPublic: room.isPublic,
                maxListeners: room.maxListeners
            }
        } catch (error: any) {
            fastify.log.error(error)
            reply.code(500)
            return { error: error.message }
        }
    })

    // Get all rooms for a guild
    fastify.get('/:guildId', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }

        const rooms = await prisma.room.findMany({
            where: { guildId },
            orderBy: { createdAt: 'desc' }
        })

        return rooms.map((room: any) => ({
            id: room.id,
            name: room.name,
            voiceChannelId: room.voiceChannelId,
            textChannelId: room.textChannelId,
            ownerId: room.ownerId,
            isPublic: room.isPublic,
            maxListeners: room.maxListeners,
            createdAt: room.createdAt
        }))
    })

    // Delete a room
    fastify.delete('/:guildId/:roomId', async (request, reply) => {
        const { guildId, roomId } = request.params as { guildId: string; roomId: string }

        const room = await prisma.room.findUnique({
            where: { id: roomId }
        })

        if (!room || room.guildId !== guildId) {
            reply.code(404)
            return { error: 'Room not found' }
        }

        const guild = fastify.discord.guilds.cache.get(guildId)
        if (guild) {
            // Delete Discord channels
            try {
                const voiceChannel = await guild.channels.fetch(room.voiceChannelId)
                await voiceChannel?.delete()
            } catch (error) {
                fastify.log.warn(`Failed to delete voice channel ${room.voiceChannelId}`)
            }

            if (room.textChannelId) {
                try {
                    const textChannel = await guild.channels.fetch(room.textChannelId)
                    await textChannel?.delete()
                } catch (error) {
                    fastify.log.warn(`Failed to delete text channel ${room.textChannelId}`)
                }
            }
        }

        await prisma.room.delete({
            where: { id: roomId }
        })

        return { success: true }
    })

    // Update room permissions
    fastify.patch('/:guildId/:roomId/permissions', async (request, reply) => {
        const { guildId, roomId } = request.params as { guildId: string; roomId: string }
        const { userId, allow } = request.body as { userId: string; allow: boolean }

        const room = await prisma.room.findUnique({
            where: { id: roomId }
        })

        if (!room || room.guildId !== guildId) {
            reply.code(404)
            return { error: 'Room not found' }
        }

        const guild = fastify.discord.guilds.cache.get(guildId)
        if (!guild) {
            reply.code(404)
            return { error: 'Guild not found' }
        }

        try {
            const voiceChannel = await guild.channels.fetch(room.voiceChannelId)
            if (voiceChannel && voiceChannel.isVoiceBased()) {
                await voiceChannel.permissionOverwrites.edit(userId, {
                    Connect: allow,
                    Speak: allow
                })

                if (room.textChannelId) {
                    const textChannel = await guild.channels.fetch(room.textChannelId)
                    if (textChannel && 'permissionOverwrites' in textChannel) {
                        await textChannel.permissionOverwrites.edit(userId, {
                            ViewChannel: allow,
                            SendMessages: allow
                        })
                    }
                }
            }

            return { success: true }
        } catch (error: any) {
            fastify.log.error(error)
            reply.code(500)
            return { error: error.message }
        }
    })
}

export default rooms
export const autoPrefix = '/rooms'
