import { createClient, RedisClientOptions } from 'redis'
import config from './config.js'

let client: any

const options: RedisClientOptions = {
  url: config.get('redisUri'),
}

async function connect (): Promise<void> {
  client = await createClient(options).connect()
}

export { client, connect }
