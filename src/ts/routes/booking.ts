import { ServerRoute, Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'

const routes: ServerRoute[] = [{
  method: 'GET',
  path: '/booking',
  handler: (_request: Request, h: ResponseToolkit): ResponseObject => {
    return h.view('booking')
  },
}, {
  method: 'POST',
  path: '/booking',
  handler: (_request: Request, h: ResponseToolkit): ResponseObject => {
    const random = Math.random()
    if (random < 0.5) {
      return h.redirect('booking/unavailable')
    }
    return h.redirect('booking/confirmation')
  }
}, {
  method: 'GET',
  path: '/booking/confirmation',
  handler: (_request: Request, h: ResponseToolkit): ResponseObject => {
    return h.view('confirmation')
  }
}, {
  method: 'GET',
  path: '/booking/unavailable',
  handler: (_request: Request, h: ResponseToolkit): ResponseObject => {
    return h.view('unavailable')
  }
}]

export default routes
