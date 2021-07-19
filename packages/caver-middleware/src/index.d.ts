import IBuiltins from './builtins'

export interface JsonRPCPayloadObject {
    jsonrpc: string
    id: number
    method: Function
    params: any[],
}

export default class Middleware {
    constructor()
    
    builtin: IBuiltins

    getMiddlewares():  Function[]
    registerMiddleware(middleware: Function): void
    applyMiddleware(data: JsonRPCPayloadObject, type: string, sendRequest?: Function): void
}