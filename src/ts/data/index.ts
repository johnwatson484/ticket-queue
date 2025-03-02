import crypto from 'crypto'
import { MongoClient } from 'mongodb'
import config from '../config.js'

const client: MongoClient = new MongoClient(config.get('mongoUri'))
await client.connect()

const db: any = client.db('ticket-queue')
const collection: any = db.collection('tickets')

async function countAvailableTickets () : Promise<number> {
  return collection.countDocuments({ reservedDate: undefined, confirmedDate: undefined })
}

async function createTickets (numberToCreate: number = 5) : Promise<void> {
  const tickets: Ticket[] = Array.from({ length: numberToCreate }, () => ({
    _id: undefined,
    reservedDate: undefined,
    confirmedDate: undefined,
    bookingNumber: undefined,
  }))

  await collection.insertMany(tickets)
}

async function deleteAllTickets () : Promise<void> {
  await collection.deleteMany({})
}

async function reserveTickets (numberToReserve: number) : Promise<string> {
  const bookingNumber: string = createBookingNumber()
  const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString()

  const ticketsToReserve = await collection.find(
    {
      $or: [
        { reservedDate: undefined },
        { reservedDate: { $lt: twentyMinutesAgo } }
      ],
      confirmedDate: undefined
    }
  ).limit(numberToReserve).toArray()

  if (ticketsToReserve.length < numberToReserve) {
    throw new Error('Tickets not available')
  }

  const ticketIds = ticketsToReserve.map((ticket: { _id: any }) => ticket._id)
  const reservedDate = new Date().toISOString()

  await collection.updateMany(
    { _id: { $in: ticketIds } },
    { $set: { reservedDate, bookingNumber } },
    { upsert: false, multi: true }
  )

  return bookingNumber
}

async function getUnpaidTicketsByBookingNumber (bookingNumber: string) : Promise<Ticket[]> {
  return collection.find({ reservedDate: { $ne: undefined }, confirmedDate: undefined, bookingNumber }).toArray()
}

function createBookingNumber () : string {
  return crypto.randomUUID()
}

async function getTicketsByBookingNumber (bookingNumber: string) : Promise<Ticket[]> {
  return collection.find({ bookingNumber, confirmedDate: { $ne: undefined } }).toArray()
}

type Ticket = {
  _id: number | undefined
  reservedDate: Date | undefined
  confirmedDate: Date | undefined
  bookingNumber: string | undefined
}

async function payForTickets (bookingNumber: string, tickets: number) : Promise<void> {
  const unpaidTickets: Ticket[] = await getUnpaidTicketsByBookingNumber(bookingNumber)

  if (unpaidTickets.length < tickets) {
    throw new Error('Tickets not available')
  }

  const ticketIds = unpaidTickets.map((ticket: { _id: any }) => ticket._id)
  const confirmedDate = new Date().toISOString()

  await collection.updateMany(
    { _id: { $in: ticketIds } },
    { $set: { confirmedDate } },
    { upsert: false, multi: true }
  )
}

export {
  client,
  countAvailableTickets,
  createTickets,
  deleteAllTickets,
  reserveTickets,
  getTicketsByBookingNumber,
  getUnpaidTicketsByBookingNumber,
  Ticket,
  payForTickets
}
