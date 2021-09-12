import type { WatchOptions } from 'chokidar';
import { Plugin } from 'vite';
export * from './type';
export interface viteMockPluginOptions extends WatchOptions {
    dir: string[] | string;
    /**
     * @description: 路径前缀
     * @default: /mock
     */
    mockPrefix?: string;
    include?: RegExp | ((filename: string) => boolean);
    exclude?: RegExp | ((filename: string) => boolean);
}
declare function viteMockPlugin(options: viteMockPluginOptions): Plugin;
export { viteMockPlugin };
export default viteMockPlugin;
