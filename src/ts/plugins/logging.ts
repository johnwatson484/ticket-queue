import HapiPino from 'hapi-pino'

const plugin: any = {
  plugin: HapiPino,
  options: {
    logPayload: true,
    level: 'warn',
  },
}

export default plugin
