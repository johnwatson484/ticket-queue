import { Server, ServerOptions, Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'
import { Boom } from '@hapi/boom'

const plugin: any = {
  plugin: {
    name: 'errors',
    register: (server: Server, _options: ServerOptions) => {
      server.ext('onPreResponse', (request: Request, h: ResponseToolkit) => {
        const response: ResponseObject | Boom = request.response

        if (response instanceof Boom) {
          const statusCode = response.output.statusCode

          if (statusCode === 404) {
            return h.view('404').code(statusCode)
          }

          request.log('error', {
            statusCode,
            message: response.message,
            stack: response.data?.stack,
          })

          return h.view('500').code(statusCode)
        }
        return h.continue
      })
    },
  },
}

export default plugin
