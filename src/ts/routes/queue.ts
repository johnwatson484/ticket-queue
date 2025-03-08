import { ServerRoute, Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'
import { countAvailableTickets } from '../services/tickets.js'
import { addToWaitingQueue, hasBeenProcessed } from '../services/queue.js'

const route: ServerRoute[] = [{
  method: 'POST',
  path: '/queue/join',
  handler: async (_request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
    const availableTickets: number = await countAvailableTickets()

    if (availableTickets === 0) {
      return h.redirect('/booking/unavailable')
    }

    return h.redirect('/queue')
  },
}, {
  method: 'GET',
  path: '/queue',
  handler: (request: Request, h: ResponseToolkit): ResponseObject => {
    const queueId: string = request.yar.id
    addToWaitingQueue(queueId)
    return h.view('queue', { queueId })
  }
}, {
  method: 'POST',
  path: '/queue/ws',
  config: {
    plugins: {
      crumb: false,
      websocket: {
        only: true,
        autoping: 5 * 1000,
        connect: ({ ws }: { ws: WebSocket }) => {
          console.log('WebSocket connected')

          ws.on('message', (message: string) => {
            const { queueId } = JSON.parse(message)
            console.log(`Client subscribed with queueId: ${queueId}`)

            const interval = setInterval(() => {
              if (hasBeenProcessed(queueId)) {
                ws.send(JSON.stringify({ queueId, status: 'processed' }))
                clearInterval(interval)
                ws.close()
              }
            }, 1000)
          })
        }
      },
    }
  },
  handler: (_request: Request, h: ResponseToolkit): ResponseObject => {
    return h.response({ status: 'accepted' })
  },
}]

export default route
