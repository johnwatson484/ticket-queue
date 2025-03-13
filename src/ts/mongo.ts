import { MongoClient, Db, Collection } from 'mongodb'
import config from './config.js'

let client: MongoClient
let collection: Collection

async function connect (): Promise<void> {
  if (!client) {
    client = new MongoClient(config.get('mongoUri'))
    await client.connect()
  }

  if (!collection) {
    const db: Db = client.db('ticket-queue')
    collection = db.collection('tickets')
  }
}

export { client, collection, connect }
