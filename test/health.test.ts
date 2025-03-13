import { expect, test, describe, beforeEach, afterEach, vi } from 'vitest'
import { Server, ServerInjectOptions, ServerInjectResponse } from '@hapi/hapi'

vi.mock('../src/dist/mongo.js')
vi.mock('../src/dist/redis.js')

const { createServer } = await import('../src/dist/server.js')

describe('health test', () => {
  let server: Server

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('GET /healthy route returns 200', async () => {
    const options: ServerInjectOptions = {
      method: 'GET',
      url: '/healthy',
    }
    const response: ServerInjectResponse = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('GET /healthz route returns 200', async () => {
    const options: ServerInjectOptions = {
      method: 'GET',
      url: '/healthz',
    }
    const response: ServerInjectResponse = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})
