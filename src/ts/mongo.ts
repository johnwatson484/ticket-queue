import { MongoClient, Db, Collection } from 'mongodb'
import config from './config.js'

const client: MongoClient = new MongoClient(config.get('mongoUri'))

const db: Db = client.db('ticket-queue')
const collection: Collection = db.collection('tickets')

async function connect (): Promise<void> {
  await client.connect()
}

export { client, collection, connect }
