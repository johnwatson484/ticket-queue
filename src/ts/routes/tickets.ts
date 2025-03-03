import { ServerRoute, Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'
import { countAvailableTickets, createTickets, deleteAllTickets } from '../services/tickets.js'

const routes: ServerRoute[] = [{
  method: 'GET',
  path: '/tickets',
  handler: async (_request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
    const availableTickets: number = await countAvailableTickets()
    return h.view('tickets', { availableTickets })
  }
},
{
  method: 'POST',
  path: '/tickets/create',
  handler: async (_request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
    await createTickets()
    return h.redirect('/tickets')
  },
}, {
  method: 'POST',
  path: '/tickets/delete',
  handler: async (_request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
    await deleteAllTickets()
    return h.redirect('/tickets')
  }
}]

export default routes
