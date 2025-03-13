import { createClient, RedisClientOptions } from 'redis'
import config from './config.js'

const options: RedisClientOptions = {
  url: config.get('redisUri'),
}

const client: any = createClient(options)

async function connect (): Promise<void> {
  await client.connect()
}

export { client, connect }
