# Vite-Plugin-Mock

## Install

```sh
npm install @col0ring/vite-plugin-mock -D
# or
yarn add @col0ring/vite-plugin-mock -D
```

## Usage

```js
import { defineConfig } from 'vite'
import path from 'path'
import viteMockPlugin from '@col0ring/vite-plugin-mock'

function resolve(relativePath) {
  return path.resolve(__dirname, relativePath)
}

export default defineConfig({
  plugins: [
    // ...
    viteMockPlugin({
      dir: resolve('./mock')
      // or multiple dirs
      // dir: [resolve('./mock'),resolve('./mock2')]
    })
  ]
})
```

### Options

#### `dir`

- Type: `string | string[]`

The directory you want to watch.

#### `mockPrefix`

- Type: `string`
- Default: `/mock`

Path prefix for all mock requests.

#### `include`

- Type: `RegExp | ((filename: string) => boolean)`
- Default: `'node_modules'`

A RegExp or a filter function, to include when loading files.

#### `exclude`

- Type: `RegExp | ((filename: string) => boolean)`
- Default: `'node_modules'`

A RegExp or a filter function, to exclude when loading files.
