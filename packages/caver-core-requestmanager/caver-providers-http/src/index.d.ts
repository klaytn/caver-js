import { XMLHttpRequest } from 'xhr2-cookies'

export default class HttpProvider {
    constructor(host: string, options?: object)

    _prepareRequest(): XMLHttpRequest
    send(payload: object, callback?: Function): void
    supportsSubscriptions(): boolean
}