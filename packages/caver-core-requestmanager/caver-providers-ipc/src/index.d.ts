export default class IpcProvider {
    constructor(path: any, net?: any)

    responseCallbacks: object
    notificationCallbacks: any[]
    path: any
    connection: any

    addDefaultEvents(): void
    _parseResponse(data: string): object[]
    _addResponseCallback(payload: object, callback?: Function): void
    _timeout(): void
    reconnect(): void
    on(type: string, callback?: Function): void
    once(type: string, callback?: Function): void
    removeListener(type: string, callback?: Function): void
    removeAllListeners(type: string): void
    reset(): void
    supportsSubscriptions(): boolean
}