import { ObjectId } from 'mongodb'

interface Ticket {
  _id: ObjectId
  reservedDate?: Date
  confirmedDate?: Date
  bookingNumber?: string
}

interface Reservation {
  bookingNumber: string
  tickets: number
  reservedDate: Date
  expirationDate: Date
}

export { Ticket, Reservation }
