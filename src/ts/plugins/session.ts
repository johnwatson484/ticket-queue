import Yar from '@hapi/yar'
import config from '../config.js'

const plugin: any = {
  plugin: Yar,
  options: {
    cookieOptions: {
      password: config.get('sessionPassword'),
      isSecure: !config.get('isDev'),
    },
  },
}

export default plugin
