import { ServerRoute, Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'
import {
  getReservationExpirationDate,
  getTicketsByBookingNumber,
  getUnpaidTicketsByBookingNumber,
  payForTickets,
  reserveTickets,
} from '../services/booking.js'
import Joi from 'joi'
import { countAvailableTickets } from '../services/tickets.js'
import { Reservation, Ticket } from '../types.js'
import { isInProgress } from '../services/queue.js'

const routes: ServerRoute[] = [{
  method: 'GET',
  path: '/booking',
  handler: async (request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
    const userId: string = request.yar.id
    const inProgress: boolean = await isInProgress(userId)
    if (!inProgress) {
      return h.redirect('/queue')
    }
    return h.view('booking')
  },
}, {
  method: 'POST',
  path: '/booking',
  options: {
    validate: {
      payload: {
        tickets: Joi.number().integer().min(1).max(10).required(),
      },
      failAction: (_request: Request, h: ResponseToolkit, err: Error | undefined): ResponseObject => {
        return h.view('booking', { error: err?.message }).takeover()
      },
    },
  },
  handler: async (request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
    const inProgress: boolean = await isInProgress(request.yar.id)
    if (!inProgress) {
      return h.redirect('/queue')
    }

    const { tickets: requiredTickets } = request.payload as { tickets: number }
    const availableTickets: number = await countAvailableTickets()

    if (requiredTickets > availableTickets) {
      return h.redirect('/booking/unavailable')
    }

    try {
      const reservation: Reservation = await reserveTickets(requiredTickets)
      return h.redirect(`/booking/payment/${reservation.bookingNumber}`)
    } catch (err: any) {
      if (err?.message === 'Tickets not available') {
        return h.redirect('/booking/unavailable')
      }
      throw err
    }
  }
}, {
  method: 'GET',
  path: '/booking/payment/{bookingNumber}',
  options: {
    validate: {
      params: {
        bookingNumber: Joi.string().required(),
      },
    },
  },
  handler: async (request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
    const inProgress: boolean = await isInProgress(request.yar.id)
    if (!inProgress) {
      return h.redirect('/queue')
    }

    const tickets: Ticket[] = await getUnpaidTicketsByBookingNumber(request.params.bookingNumber)
    if (tickets.length === 0) {
      return h.view('404').code(404)
    }
    const expirationDate: string = getReservationExpirationDate(tickets[0].reservedDate).toLocaleString()
    return h.view('payment', { bookingNumber: request.params.bookingNumber, tickets, expirationDate })
  }
}, {
  method: 'POST',
  path: '/booking/payment',
  options: {
    validate: {
      payload: {
        bookingNumber: Joi.string().required(),
        tickets: Joi.number().integer().min(1).max(10).required(),
      },
      failAction: (_request: Request, h: ResponseToolkit, err: Error | undefined): ResponseObject => {
        return h.view('payment', { error: err?.message }).takeover()
      },
    },
  },
  handler: async (request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
    const inProgress: boolean = await isInProgress(request.yar.id)
    if (!inProgress) {
      return h.redirect('/queue')
    }

    const { bookingNumber, tickets } = request.payload as { bookingNumber: string, tickets: number }
    const userId: string = request.yar.id
    try {
      await payForTickets(bookingNumber, tickets, userId)
      return h.redirect(`/booking/confirmation/${bookingNumber}`)
    } catch (err: any) {
      if (err?.message === 'Tickets not available') {
        return h.redirect('/booking/unavailable')
      }
      throw err
    }
  }
}, {
  method: 'GET',
  path: '/booking/confirmation/{bookingNumber}',
  options: {
    validate: {
      params: {
        bookingNumber: Joi.string().required(),
      },
    },
  },
  handler: async (request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
    const tickets: Ticket[] = await getTicketsByBookingNumber(request.params.bookingNumber)

    if (tickets.length === 0) {
      return h.view('404').code(404)
    }

    return h.view('confirmation', { tickets })
  }
}, {
  method: 'GET',
  path: '/booking/unavailable',
  handler: (_request: Request, h: ResponseToolkit): ResponseObject => {
    return h.view('unavailable')
  }
}]

export default routes
