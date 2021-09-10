import { Connect } from 'vite';
import { MockRoutes } from './type';
export interface loadMockFilesOptions {
    dir: string | string[];
    include?: RegExp | ((filename: string) => boolean);
    exclude?: RegExp | ((filename: string) => boolean);
}
export declare function parseBody(req: Connect.IncomingMessage): Promise<Record<string, any>>;
export declare function matchFiles({ file, include, exclude }: {
    file: string;
    include?: RegExp | ((filename: string) => boolean);
    exclude?: RegExp | ((filename: string) => boolean);
}): boolean;
export declare function loadFile(filename: string): Promise<MockRoutes>;
export declare function loadMockFiles({ dir, exclude, include }: loadMockFilesOptions): Promise<MockRoutes | null>;
