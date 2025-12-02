import { PrismaClient } from '@prisma/client'
import { Client } from 'discord.js'
import { Kazagumo } from 'kazagumo'

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient
        discord: Client
        music: Kazagumo
    }
}
