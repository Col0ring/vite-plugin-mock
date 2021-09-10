import * as fs from 'fs'
import { build } from 'esbuild'
import * as path from 'path'
import { Connect } from 'vite'
import { MethodsType, MockRoutes, NodeModuleWithCompile, Routes } from './type'

export interface loadMockFilesOptions {
  dir: string | string[]
  include?: RegExp | ((filename: string) => boolean)
  exclude?: RegExp | ((filename: string) => boolean)
}

function safeJsonParse<T extends Record<string | number | symbol, any>>(
  jsonStr: string,
  defaultValue: T
) {
  try {
    return JSON.parse(jsonStr)
  } catch (err) {
    return defaultValue
  }
}

// TODO: parse file
export function parseBody(
  req: Connect.IncomingMessage
): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', function (chunk) {
      body += chunk
    })
    req.on('end', function () {
      resolve(safeJsonParse(body, {}))
    })
  })
}

export function matchFiles({
  file,
  include,
  exclude
}: {
  file: string
  include?: RegExp | ((filename: string) => boolean)
  exclude?: RegExp | ((filename: string) => boolean)
}): boolean {
  if (
    (exclude instanceof RegExp && exclude.test(file)) ||
    (typeof exclude === 'function' && exclude(file))
  ) {
    return false
  }
  if (
    include &&
    !(
      (include instanceof RegExp && include.test(file)) ||
      (typeof include === 'function' && include(file))
    )
  ) {
    return false
  }
  return true
}

export async function loadFile(filename: string) {
  const mockRoutes: MockRoutes = {}
  if (fs.statSync(filename).isDirectory()) {
    return mockRoutes
  }
  const { prefix: routePrefix, default: routes } = (await resolveModule(
    filename
  )) as {
    prefix?: string
    default: Routes
  }
  typeof routes === 'object' &&
    routes !== null &&
    Object.keys(routes).forEach((routeKey) => {
      const [method, routePath] = routeKey.split(' ')
      mockRoutes[path.join(routePrefix || '', routePath) as keyof MockRoutes] =
        {
          method: method as MethodsType,
          handler: routes[routeKey as keyof Routes]
        }
    })
  return mockRoutes
}

async function loadDir({
  dir,
  include,
  exclude
}: Omit<loadMockFilesOptions, 'dir'> & { dir: string }) {
  const mockRoutes: MockRoutes = {}
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir)
    const childMockRoutesArr = await Promise.all(
      files
        .map((file) => path.resolve(dir, file))
        .filter((file) => matchFiles({ include, exclude, file }))
        .map((file) => {
          const currentPath = path.resolve(dir, file)
          const stat = fs.statSync(currentPath)
          if (stat.isDirectory()) {
            return loadDir({
              include,
              exclude,
              dir: currentPath
            })
          } else {
            return loadFile(currentPath)
          }
        })
    )
    childMockRoutesArr.forEach((childMockRoutes) => {
      Object.keys(childMockRoutes).forEach((key) => {
        mockRoutes[key as keyof MockRoutes] =
          childMockRoutes[key as keyof MockRoutes]
      })
    })
  }
  return mockRoutes
}

export async function loadMockFiles({
  dir,
  exclude,
  include
}: loadMockFilesOptions): Promise<MockRoutes | null> {
  let mockRoutes: MockRoutes | null = null
  if (Array.isArray(dir)) {
    mockRoutes = (
      await Promise.all(dir.map((d) => loadDir({ dir: d, exclude, include })))
    ).reduce((prev, next) => {
      return { ...prev, ...next }
    }, {} as MockRoutes)
  } else {
    mockRoutes = await loadDir({ dir, exclude, include })
  }
  return mockRoutes
}

async function resolveModule(filename: string): Promise<any> {
  if (filename.endsWith('.ts')) {
    const res = await build({
      entryPoints: [filename],
      write: false,
      platform: 'node',
      bundle: true,
      format: 'cjs',
      target: 'es2015'
    })
    const { text } = res.outputFiles[0]
    return loadConfigFromBundledFile(filename, text)
  }
  // 一定要删除缓存
  delete require.cache[filename]
  return require(filename)
}

async function loadConfigFromBundledFile(
  filename: string,
  bundle: string
): Promise<any> {
  const extension = path.extname(filename)
  const defaultLoader = require.extensions[extension]
  require.extensions[extension] = (module: NodeModule, fName: string) => {
    if (filename === fName) {
      ;(module as NodeModuleWithCompile)._compile(bundle, filename)
    } else {
      defaultLoader?.(module, fName)
    }
  }

  // 删除缓存
  delete require.cache[filename]
  const moduleValue = require(filename)
  // 改回原样
  if (defaultLoader) {
    require.extensions[extension] = defaultLoader
  }
  return moduleValue
}
