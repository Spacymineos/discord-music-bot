import { join } from 'node:path'
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify'

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> { }

const options: AppOptions = {}

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // Load environment variables
  await fastify.register(import('@fastify/env'), {
    dotenv: true,
    schema: {
      type: 'object',
      required: ['DISCORD_TOKEN'],
      properties: {
        DISCORD_TOKEN: { type: 'string' },
        PORT: { type: 'number', default: 3001 },
        HOST: { type: 'string', default: '0.0.0.0' }
      }
    }
  })

  // Load translations
  const { i18n } = await import('./lib/i18n.js')
  await i18n.loadTranslations()

  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  })

  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts,
    routeParams: true
  })
}

export default app
export { app, options }
