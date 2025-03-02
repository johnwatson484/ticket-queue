import { ServerRoute, Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'

const routes: ServerRoute[] = [{
  method: 'GET',
  path: '/healthy',
  handler: (_request: Request, h: ResponseToolkit): ResponseObject => {
    return h.response('ok')
  },
}, {
  method: 'GET',
  path: '/healthz',
  handler: (_request: Request, h: ResponseToolkit): ResponseObject => {
    return h.response('ok')
  },
}]

export default routes
