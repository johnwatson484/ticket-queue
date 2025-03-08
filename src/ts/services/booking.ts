import crypto from 'crypto'
import { ObjectId } from 'mongodb'
import { Ticket, Reservation } from '../types.js'
import { client, collection } from '../mongo.js'
import { removeFromInProgressQueue } from './queue.js'

const RESERVATION_EXPIRATION = 1 * 60 * 1000

async function reserveTickets (numberToReserve: number): Promise<Reservation> {
  const session = client.startSession()
  session.startTransaction()

  try {
    const bookingNumber: string = createBookingNumber()
    const reserveExpirationDate = new Date(Date.now() - RESERVATION_EXPIRATION).toISOString()

    const ticketsToReserve: Ticket[] = await collection.find(
      {
        $or: [
          { reservedDate: undefined },
          { reservedDate: { $lt: reserveExpirationDate } }
        ],
        confirmedDate: undefined
      },
      { session }
    ).limit(numberToReserve).toArray()

    if (ticketsToReserve.length < numberToReserve) {
      throw new Error('Tickets not available')
    }

    const ticketIds: ObjectId[] = ticketsToReserve.map((ticket: Ticket) => ticket._id)
    const reservedDate = new Date().toISOString()

    await collection.updateMany(
      { _id: { $in: ticketIds } },
      { $set: { reservedDate, bookingNumber } },
      { session, upsert: false }
    )

    await session.commitTransaction()
    session.endSession()

    return {
      bookingNumber,
      tickets: numberToReserve,
      reservedDate: new Date(),
      expirationDate: new Date(Date.now() + RESERVATION_EXPIRATION)
    }
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

function createBookingNumber () : string {
  return crypto.randomUUID()
}

async function getUnpaidTicketsByBookingNumber (bookingNumber: string) : Promise<Ticket[]> {
  return collection.find({ reservedDate: { $ne: undefined }, confirmedDate: undefined, bookingNumber }).toArray()
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

async function payForTickets (bookingNumber: string, tickets: number, queueId: string): Promise<void> {
  const session = client.startSession()
  session.startTransaction()

  try {
    const unpaidTickets: Ticket[] = await collection.find(
      { reservedDate: { $ne: undefined }, confirmedDate: undefined, bookingNumber },
      { session }
    ).toArray()

    if (unpaidTickets.length < tickets) {
      throw new Error('Tickets not available')
    }

    const ticketIds: ObjectId[] = unpaidTickets.map((ticket: Ticket) => ticket._id)
    const confirmedDate = new Date().toISOString()

    await collection.updateMany(
      { _id: { $in: ticketIds } },
      { $set: { confirmedDate } },
      { session, upsert: false }
    )

    removeFromInProgressQueue(queueId)

    await session.commitTransaction()
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

export {
  getReservationExpirationDate,
  getTicketsByBookingNumber,
  getUnpaidTicketsByBookingNumber,
  payForTickets,
  reserveTickets,
}
