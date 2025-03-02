import crypto from 'crypto'
import { MongoClient } from 'mongodb'
import config from '../config.js'

const RESERVATION_EXPIRATION = 1 * 60 * 1000

const client: MongoClient = new MongoClient(config.get('mongoUri'))
await client.connect()

const db: any = client.db('ticket-queue')
const collection: any = db.collection('tickets')

async function countAvailableTickets () : Promise<number> {
  const reserveExpirationDate = new Date(Date.now() - RESERVATION_EXPIRATION).toISOString()
  return collection.countDocuments({
    $or: [
      { reservedDate: undefined },
      { reservedDate: { $lt: reserveExpirationDate } }
    ],
    confirmedDate: undefined
  })
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

async function reserveTickets (numberToReserve: number) : Promise<Reservation> {
  const bookingNumber: string = createBookingNumber()
  const reserveExpirationDate = new Date(Date.now() - RESERVATION_EXPIRATION).toISOString()

  const ticketsToReserve = await collection.find(
    {
      $or: [
        { reservedDate: undefined },
        { reservedDate: { $lt: reserveExpirationDate } }
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

  const reservation: Reservation = {
    bookingNumber,
    tickets: numberToReserve,
    reservedDate: new Date(),
    expirationDate: new Date(Date.now() + RESERVATION_EXPIRATION)
  }

  return reservation
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

function getReservationExpirationDate (reservedDate: Date | undefined) : Date {
  if (!reservedDate) {
    throw new Error('Invalid reserved date')
  }
  return new Date(new Date(reservedDate).getTime() + RESERVATION_EXPIRATION)
}

type Ticket = {
  _id: number | undefined
  reservedDate: Date | undefined
  confirmedDate: Date | undefined
  bookingNumber: string | undefined
}

type Reservation = {
  bookingNumber: string
  tickets: number
  reservedDate: Date
  expirationDate: Date
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
  Reservation,
  payForTickets,
  getReservationExpirationDate,
}
