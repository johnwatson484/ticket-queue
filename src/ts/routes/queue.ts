import { ServerRoute, Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'

const route: ServerRoute = {
  method: 'POST',
  path: '/queue/join',
  handler: (_request: Request, h: ResponseToolkit): ResponseObject => {
    return h.redirect('/booking')
  },
}

export default route
