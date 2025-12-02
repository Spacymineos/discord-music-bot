import { FastifyPluginAsync } from 'fastify'

const voiceRoutes: FastifyPluginAsync = async (fastify) => {
    // Get bot's current voice state in a guild
    fastify.get('/:guildId/status', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }

        try {
            const guild = await fastify.discord.guilds.fetch(guildId)
            const botMember = await guild.members.fetch(fastify.discord.user!.id)
            const voiceState = botMember.voice

            return {
                connected: voiceState.channel !== null,
                channelId: voiceState.channelId,
                channelName: voiceState.channel?.name || null,
                channelType: voiceState.channel?.type || null,
                memberCount: voiceState.channel?.members.size || 0,
                members: voiceState.channel?.members.map(m => ({
                    id: m.id,
                    username: m.user.username,
                    avatar: m.user.displayAvatarURL()
                })) || []
            }
        } catch (error) {
            fastify.log.error(error)
            return reply.code(500).send({ error: 'Failed to get voice status' })
        }
    })

    // Get all voice channels in a guild
    fastify.get('/:guildId/channels', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }

        try {
            const guild = await fastify.discord.guilds.fetch(guildId)
            const channels = await guild.channels.fetch()

            const voiceChannels = channels
                .filter(c => c?.type === 2) // Voice channels
                .map(c => ({
                    id: c!.id,
                    name: c!.name,
                    memberCount: c!.members?.size || 0,
                    members: c!.members?.map(m => ({
                        id: m.id,
                        username: m.user.username,
                        avatar: m.user.displayAvatarURL(),
                        bot: m.user.bot
                    })) || []
                }))

            return { channels: voiceChannels }
        } catch (error) {
            fastify.log.error(error)
            return reply.code(500).send({ error: 'Failed to get voice channels' })
        }
    })

    // Join a voice channel
    fastify.post('/:guildId/join', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }
        const { channelId } = request.body as { channelId: string }

        try {
            const guild = await fastify.discord.guilds.fetch(guildId)
            const channel = await guild.channels.fetch(channelId)

            if (!channel || channel.type !== 2) {
                return reply.code(400).send({ error: 'Invalid voice channel' })
            }

            // Create player (connects automatically)
            await fastify.music.createPlayer({
                guildId: guild.id,
                textId: channel.id, // We don't have a text channel here, so use voice channel ID as fallback or maybe we should require it? Kazagumo needs it.
                voiceId: channel.id,
                volume: 50
            })

            return {
                success: true,
                channelId: channel.id,
                channelName: channel.name
            }
        } catch (error) {
            fastify.log.error(error)
            return reply.code(500).send({ error: 'Failed to join voice channel' })
        }
    })

    // Leave voice channel
    fastify.post('/:guildId/leave', async (request, reply) => {
        const { guildId } = request.params as { guildId: string }

        try {
            const player = fastify.music.players.get(guildId)
            if (player) {
                player.destroy()
            }

            return { success: true }
        } catch (error) {
            fastify.log.error(error)
            return reply.code(500).send({ error: 'Failed to leave voice channel' })
        }
    })
}

export default voiceRoutes
export const autoPrefix = '/voice'
