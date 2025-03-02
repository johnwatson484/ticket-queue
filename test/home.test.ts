import { Server, ServerInjectOptions, ServerInjectResponse } from '@hapi/hapi'
import { createServer } from '../src/dist/server.js'

describe('home test', () => {
  let server: Server

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('GET /home route returns 200', async () => {
    const options: ServerInjectOptions = {
      method: 'GET',
      url: '/',
    }
    const response: ServerInjectResponse = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})
