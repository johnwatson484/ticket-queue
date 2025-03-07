import { ServerRoute, Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'
import { countAvailableTickets } from '../services/tickets.js'

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
    waitingQueue.push(queueId)
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
        connect: ({ ws, _request }) => {
          console.log('WebSocket connected')

          ws.on('message', (message) => {
            const { queueId } = JSON.parse(message)
            console.log(`Client subscribed with queueId: ${queueId}`)

            const interval = setInterval(() => {
              if (processedQueue.includes(queueId)) {
                ws.send(`${queueId}-processed`)
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
    return h.response('WebSocket endpoint')
  },
}]

const waitingQueue: string[] = []
const processedQueue: string[] = []

function processQueue () {
  if (waitingQueue.length > 0) {
    const queueId: string = waitingQueue.shift()
    console.log(`Processing queueId: ${queueId}`)
    processedQueue.push(queueId)
  }
}

setInterval(processQueue, 5000)

export default route
