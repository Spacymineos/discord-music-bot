import fp from 'fastify-plugin'
import { Client, GatewayIntentBits } from 'discord.js'

declare module 'fastify' {
    interface FastifyInstance {
        discord: Client
    }
}

export default fp(async (fastify, opts) => {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildVoiceStates,
        ],
    })

    client.once('clientReady', () => {
        fastify.log.info(`Discord bot logged in as ${client.user?.tag}`)
    })

    client.on('error', (error) => {
        fastify.log.error({ err: error }, 'Discord client error')
    })

    // Login after all plugins are loaded to ensure listeners are attached
    fastify.ready(() => {
        client.login(process.env.DISCORD_TOKEN).catch((error) => {
            fastify.log.error({ err: error }, 'Failed to login to Discord')
        })
    })

    client.on('messageCreate', async (message) => {
        if (message.content === '!ping') {
            message.reply('Pong!')
        }
    })

    // Make client available throughout app
    fastify.decorate('discord', client)

    // Graceful shutdown
    fastify.addHook('onClose', async () => {
        client.destroy()
    })
}, {
    name: 'discord',
    fastify: '5.x'
})
