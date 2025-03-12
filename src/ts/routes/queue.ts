import { ServerRoute, Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'
import WebSocket from 'ws'
import { countAvailableTickets } from '../services/tickets.js'
import { addToWaitingQueue, countWaitingQueue, getPositionInQueue, isInProgress } from '../services/queue.js'

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
  handler: async (request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
    const userId: string = request.yar.id
    await addToWaitingQueue(userId)
    return h.view('queue', { userId })
  }
}, {
  method: 'POST',
  path: '/queue/ws',
  options: {
    plugins: {
      crumb: false,
      websocket: {
        only: true,
        autoping: 5 * 1000,
        connect: ({ ws }: { ws: WebSocket }) => {
          console.log('WebSocket connected')

          ws.on('message', (message: string) => {
            const { userId } = JSON.parse(message)

            const checkStatus = async () => {
              try {
                const inProgress: boolean = await isInProgress(userId)
                if (inProgress) {
                  ws.send(JSON.stringify({ userId, status: 'accepted' }))
                  ws.close()
                } else {
                  const position: number = await getPositionInQueue(userId)
                  ws.send(JSON.stringify({ userId, status: 'waiting', position }))
                  setTimeout(checkStatus, 1000)
                }
              } catch (error: any) {
                console.error('Error processing queue:', error)
                ws.send(JSON.stringify({ userId, status: 'error', message: error.message }))
                ws.close()
              }
            }
            checkStatus()
          })
        },
      },
    },
  },
  handler: async (_request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
    const position: number = await countWaitingQueue()
    return h.response({ status: 'accepted', position })
  },
}]

export default route
