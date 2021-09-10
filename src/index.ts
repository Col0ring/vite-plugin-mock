import * as chokidar from 'chokidar'
import type { WatchOptions } from 'chokidar'
import { parse } from 'querystring'
import { pathToRegexp, match } from 'path-to-regexp'
import { Plugin } from 'vite'
import { loadFile, loadMockFiles, matchFiles, parseBody } from './utils'

export interface viteMockPluginOptions extends WatchOptions {
  dir: string[] | string
  /**
   * @description: 路径前缀
   * @default: /mock
   */
  mockPrefix?: string
  include?: RegExp | ((filename: string) => boolean)
  exclude?: RegExp | ((filename: string) => boolean)
}

function viteMockPlugin(options: viteMockPluginOptions): Plugin {
  const { dir } = options
  return {
    name: 'vite-plugin-mock',
    enforce: 'pre',
    apply: 'serve',
    async configureServer({ middlewares }) {
      // 先加载所有文件
      let mockFiles = await loadMockFiles(options)
      chokidar
        .watch(dir, { ignoreInitial: true, ...options })
        .on('all', async (_, file) => {
          if (
            matchFiles({
              include: options.include,
              exclude: options.exclude,
              file
            })
          ) {
            // 缓存加载
            mockFiles = { ...mockFiles, ...(await loadFile(file)) }
          }
        })
      middlewares.use(options.mockPrefix || '/mock', async (req, res) => {
        if (mockFiles) {
          const [url, search] = req.url!.split('?')
          for (const [pathname, { handler, method }] of Object.entries(
            mockFiles
          )) {
            if (
              pathToRegexp(pathname).test(url) &&
              req.method?.toLowerCase() === method.toLowerCase()
            ) {
              // eslint-disable-next-line no-await-in-loop
              const body = await parseBody(req)
              const query = parse(search)
              const matched = match(pathname)(url)
              // eslint-disable-next-line no-await-in-loop
              const result = await handler(
                {
                  body,
                  query,
                  params:
                    (matched && (matched.params as Record<string, string>)) ||
                    {}
                },
                req,
                res
              )
              if (!res.headersSent && result) {
                res.setHeader('Content-Type', 'application/json')
                res.statusMessage = result.message || 'ok'
                res.statusCode = result.status || 200
                res.end(
                  JSON.stringify({
                    message: 'ok',
                    status: 200,
                    ...result
                  })
                )
              }
              return
            }
          }
          res.setHeader('Content-Type', 'application/json')
          res.statusMessage = '404 Not Found'
          res.statusCode = 404
          res.end(
            JSON.stringify({
              message: '404 Not Found',
              status: 404
            })
          )
        }
      })
    }
  }
}

export { viteMockPlugin }
export default viteMockPlugin
