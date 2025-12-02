import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { Kazagumo } from 'kazagumo'
import { Connectors } from 'shoukaku'

declare module 'fastify' {
    interface FastifyInstance {
        music: Kazagumo
    }
}

const musicPlugin: FastifyPluginAsync = async (fastify) => {
    fastify.log.info('Initializing Music Plugin...')
    const Nodes = [{
        name: process.env.LAVALINK_NAME || 'Localhost',
        url: process.env.LAVALINK_URL || 'localhost:2333',
        auth: process.env.LAVALINK_AUTH || 'youshallnotpass',
        secure: process.env.LAVALINK_SECURE === 'true'
    }]

    const kazagumo = new Kazagumo({
        defaultSearchEngine: 'youtube',
        send: (guildId, payload) => {
            const guild = fastify.discord.guilds.cache.get(guildId)
            if (guild) guild.shard.send(payload)
        }
    }, new Connectors.DiscordJS(fastify.discord), Nodes)

    // Event listeners
    kazagumo.shoukaku.on('ready', (name) => fastify.log.info(`Lavalink ${name} ready!`))
    kazagumo.shoukaku.on('error', (name, error) => fastify.log.error(`Lavalink ${name} error: ${error}`))
    kazagumo.shoukaku.on('close', (name, code, reason) => fastify.log.warn(`Lavalink ${name}: Closed, Code ${code}, Reason ${reason || 'No reason'}`))
    kazagumo.shoukaku.on('debug', (name, info) => fastify.log.debug(`Lavalink ${name}: Debug, ${info}`))

    kazagumo.shoukaku.on('disconnect', (name, count) => {
        const players = [...kazagumo.shoukaku.players.values()].filter(p => p.node.name === name)
        players.map(player => {
            kazagumo.destroyPlayer(player.guildId)
            player.destroy()
        })
        fastify.log.warn(`Lavalink ${name}: Disconnected`)
    })

    kazagumo.on('playerStart', async (player, track) => {
        fastify.log.info({ guildId: player.guildId, track: track.title }, 'Started playing track')

        // Save to history
        try {
            const requester: any = track.requester
            const userId = requester?.userId

            if (userId) {
                await fastify.prisma.history.create({
                    data: {
                        trackTitle: track.title,
                        trackUrl: track.uri || '',
                        trackAuthor: track.author,
                        trackThumbnail: track.thumbnail || null,
                        guildId: player.guildId,
                        userId: userId
                    }
                })
            }
        } catch (error) {
            fastify.log.error({ err: error }, 'Failed to save history')
        }

        if (!player.textId) return
        const channel = fastify.discord.channels.cache.get(player.textId)
        if (channel?.isTextBased()) {
            (channel as any).send({ content: `Now playing **${track.title}** by **${track.author}**` })
                .then((x: any) => player.data.set("message", x))
                .catch((err: any) => fastify.log.error({ err }, 'Failed to send now playing message'))
        }
    })

    kazagumo.on('playerEnd', (player) => {
        fastify.log.info({ guildId: player.guildId }, 'Track ended')
        const message = player.data.get("message")
        if (message && typeof message.edit === 'function') {
            message.edit({ content: `Finished playing` }).catch(() => { })
        }
    })

    kazagumo.on('playerEmpty', (player) => {
        fastify.log.info({ guildId: player.guildId }, 'Queue empty')
        if (player.textId) {
            const channel = fastify.discord.channels.cache.get(player.textId)
            if (channel?.isTextBased()) {
                (channel as any).send({ content: `Destroyed player due to inactivity.` })
                    .then((x: any) => player.data.set("message", x))
                    .catch(() => { })
            }
        }
        player.destroy()
    })

    // Don't block startup for Lavalink
    kazagumo.shoukaku.on('ready', (name) => {
        fastify.log.info(`Lavalink ${name} is ready and connected!`)
    })

    fastify.decorate('music', kazagumo)
}

export default fp(musicPlugin, {
    name: 'music-player',
    dependencies: ['discord']
})
