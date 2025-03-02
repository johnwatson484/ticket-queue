import { ServerRoute, Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'
import { countAvailableTickets } from '../data/index.js'

const route: ServerRoute = {
  method: 'POST',
  path: '/queue/join',
  handler: async (_request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
    const availableTickets: number = await countAvailableTickets()

    if (availableTickets === 0) {
      return h.redirect('/booking/unavailable')
    }

    return h.redirect('/booking')
  },
}

export default route
