import { Server } from '@hapi/hapi'
import Joi from 'joi'
import { registerPlugins } from './plugins/index.js'
import config from './config.js'

async function createServer (): Promise<Server> {
  const server: Server = new Server({
    host: config.get('host'),
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false,
        },
      },
    },
    router: {
      stripTrailingSlash: true,
    },
  })

  server.validator(Joi)
  await registerPlugins(server)

  return server
}

export { createServer }
