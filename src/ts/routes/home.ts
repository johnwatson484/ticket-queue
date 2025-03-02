import { ServerRoute, Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'

const route: ServerRoute = {
  method: 'GET',
  path: '/',
  handler: (_request: Request, h: ResponseToolkit): ResponseObject => {
    return h.view('home')
  },
}

export default route
