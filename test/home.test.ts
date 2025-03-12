import { expect, test, describe, beforeEach, afterEach, vi } from 'vitest'
import { Server, ServerInjectOptions, ServerInjectResponse } from '@hapi/hapi'
import { createServer } from '../src/dist/server.js'

vi.mock('../src/dist/mongo.js')
vi.mock('../src/dist/redis.js')

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
