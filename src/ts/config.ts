import convict from 'convict'
import convictFormatWithValidator from 'convict-format-with-validator'

convict.addFormats(convictFormatWithValidator)

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  isDev: {
    doc: 'True if the application is in development mode.',
    format: Boolean,
    default: process.env.NODE_ENV === 'development',
  },
  host: {
    doc: 'The host to bind.',
    format: 'ipaddress',
    default: '0.0.0.0',
    env: 'HOST',
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'PORT',
    arg: 'port',
  },
  appName: {
    doc: 'The name of the application.',
    format: String,
    default: 'Ticket Queue',
    env: 'APP_NAME',
  },
  mongoUri: {
    doc: 'The URI of the MongoDB database.',
    format: String,
    default: '',
    env: 'MONGO_URI',
  },
  redisUri: {
    doc: 'The URI of the Redis database.',
    format: String,
    default: '',
    env: 'REDIS_URI',
  },
  sessionPassword: {
    doc: 'The password for the session cookie.',
    format: String,
    default: null,
    env: 'SESSION_PASSWORD',
  },
})

config.validate({ allowed: 'strict' })

export default config
