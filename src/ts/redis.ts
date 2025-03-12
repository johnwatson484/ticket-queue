import { createClient, RedisClientOptions } from 'redis'
import config from './config.js'

const options: RedisClientOptions = {
  url: config.get('redisUri'),
}

const client = await createClient(options).connect()

export { client }
