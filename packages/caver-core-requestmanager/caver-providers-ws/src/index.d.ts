export default class WebsocketProvider {
    constructor(url: string, options?: object)

    url: string
    _customTimeout: number
    headers: object
    protocol: string
    reconnectOptions: object
    clientConfig: object
    requestOptions: any
    DATA: 'data'
    CLOSE: 'close'
    ERROR: 'error'
    CONNECT: 'connect'
    RECONNECT: 'reconnect'
    connection: object
    requestQueue: Map<any, any>
    responseQueue: Map<any, any>
    reconnectAttempts: number
    reconnecting: boolean

    connect(): void
    _onMessage(e: object): void
    _onConnect(): void
    _onClose(event: object): void
    _addSocketListeners(): void
    _removeSocketListeners(): void
    send(payload: object, callback?: Function): void
    reset(): void
    disconnect(code: number, reason: string): void
    supportsSubscriptions(): boolean
    reconnect(): void

    get connected(): boolean
}