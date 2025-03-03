import { MongoClient, Db, Collection } from 'mongodb'
import config from './config.js'

const client: MongoClient = new MongoClient(config.get('mongoUri'))
await client.connect()

const db: Db = client.db('ticket-queue')
const collection: Collection = db.collection('tickets')

export { client, collection }
