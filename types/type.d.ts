/// <reference types="node" />
import * as http from 'http';
import { Connect } from 'vite';
declare type Item<T> = T extends Array<infer U> ? U : never;
export declare type Methods = [
    'all',
    'get',
    'post',
    'put',
    'delete',
    'patch',
    'options',
    'head'
];
export declare type MethodProps = Item<Methods>;
export declare type MethodsType = MethodProps | `${Uppercase<MethodProps>}`;
export interface HandlerResult {
    status?: number;
    message?: string;
    data?: any;
}
export interface HandlerContext {
    body: Record<string, any>;
    query: Record<string, string | string[] | undefined>;
    params: Record<string, string>;
}
export declare type RouteHandle = (ctx: HandlerContext, req: Connect.IncomingMessage, res: http.ServerResponse) => Promise<HandlerResult | void> | HandlerResult | void;
export declare type Routes = Record<`${MethodsType} ${string}`, RouteHandle>;
export declare type MockRoutes = Record<`${MethodsType} ${string}`, {
    handler: RouteHandle;
    method: MethodsType;
}>;
export interface NodeModuleWithCompile extends NodeModule {
    _compile(code: string, filename: string): any;
}
export {};
