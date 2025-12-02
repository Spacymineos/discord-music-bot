import { FastifyPluginAsync } from 'fastify'
import { prisma } from '@repo/database'

const guilds: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    // Get all guilds
    fastify.get('/', async function (request, reply) {
        const guilds = fastify.discord.guilds.cache.map(guild => ({
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL(),
            memberCount: guild.memberCount,
        }))

        return guilds
    })

    // Get specific guild
    fastify.get('/:id', async function (request, reply) {
        const { id } = request.params as { id: string }
        const guild = fastify.discord.guilds.cache.get(id)

        if (!guild) {
            reply.code(404)
            return { error: 'Guild not found' }
        }

        return {
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL(),
            memberCount: guild.memberCount,
            channels: guild.channels.cache.size,
            roles: guild.roles.cache.size,
        }
    })

    // Get guild settings
    fastify.get('/:id/settings', async function (request, reply) {
        const { id } = request.params as { id: string }

        let settings = await prisma.guild.findUnique({
            where: { id }
        })

        if (!settings) {
            const guild = fastify.discord.guilds.cache.get(id)
            if (!guild) {
                reply.code(404)
                return { error: 'Guild not found' }
            }

            // Create default settings
            settings = await prisma.guild.create({
                data: {
                    id,
                    name: guild.name,
                }
            })
        }

        return settings
    })

    // Update guild settings
    fastify.patch('/:id/settings', async function (request, reply) {
        const { id } = request.params as { id: string }
        const body = request.body as any

        const settings = await prisma.guild.upsert({
            where: { id },
            update: body,
            create: {
                id,
                name: body.name || 'Unknown Server',
                ...body
            }
        })

        return settings
    })
}

export default guilds
export const autoPrefix = '/guilds'
