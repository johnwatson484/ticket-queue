import { Server, ServerRoute } from '@hapi/hapi'
import home from '../routes/home.js'
import queue from '../routes/queue.js'
import booking from '../routes/booking.js'
import tickets from '../routes/tickets.js'
import assets from '../routes/assets.js'
import health from '../routes/health.js'

const plugin: any = {
  plugin: {
    name: 'router',
    register: (server: Server) => {
      server.route(new Array<ServerRoute>().concat(
        home,
        queue,
        booking,
        tickets,
        assets,
        health
      ))
    },
  },
}

export default plugin
