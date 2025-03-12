import 'log-timestamp'
import { createServer } from './server.js'
import { Server } from '@hapi/hapi'
import { connect as connectMongo } from './mongo.js'
import { connect as connectRedis } from './redis.js'

async function init (): Promise<void> {
  await connectMongo()
  await connectRedis()
  const server: Server = await createServer()
  await server.start()
  console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', (err: Error) => {
  console.log(err)
  process.exit(1)
})

init()
