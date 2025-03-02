import path from 'path'
import { fileURLToPath } from 'url'
import nunjucks, { Template } from 'nunjucks'
import Vision from '@hapi/vision'
import config from '../config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const plugin: any = {
  plugin: Vision,
  options: {
    engines: {
      njk: {
        compile: (src: string, options: any) => {
          const template: Template = nunjucks.compile(src, options.environment)

          return (context: any) => {
            return template.render(context)
          }
        },
        prepare: (options: any, next: (err?: Error) => void) => {
          options.compileOptions.environment = nunjucks.configure(path.join(options.relativeTo || process.cwd(), options.path), {
            autoescape: true,
            watch: config.get('isDev'),
          })

          return next()
        },
      },
    },
    path: '../../views',
    relativeTo: __dirname,
    isCached: !config.get('isDev'),
    context: {
      assetPath: '/assets',
      appName: config.get('appName'),
    },
  },
}

export default plugin
