import { MongoClient } from 'mongodb'
import config from '../config.js'

const client: MongoClient = new MongoClient(config.get('mongoUri'))
await client.connect()

export { client }
