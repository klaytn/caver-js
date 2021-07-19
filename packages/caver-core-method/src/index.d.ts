export interface MethodOptions {
    accounts?: string
    call: string
    defaultAccount?: string | null
    defaultBlock?: string
    extraFormatters?: any
    hexCall?: string
    inputFormatter?: [() => void | null]
    name: string
    outputFormatter?: () => void
    outputFormatterDisable?: boolean
    params?: number
    requestManager?: any
    transformPayload?: () => void
}

export default class Method {
    constructor(options: MethodOptions)

    accounts: string
    call: string
    defaultAccount: string | null
    defaultBlock: string
    extraFormatters: any
    hexCall: string
    inputFormatter: [() => void | null]
    name: string
    outputFormatter: () => void
    outputFormatterDisable: boolean
    params: number
    requestManager: any
    transformPayload: () => void

    setRequestManager(requestManager: object, accounts: object): void
    createFunction(requestManager: object, accounts: object): Function
    attachToObject(obj: object): void
    getCall(args: any[]): string
    extractCallback(args: any[]): Function | null
    validateArgs(args: any[]): void
    formatInput(args: any[]): any[]
    formatOutput(result: object): object
    toPayload(args: any[]): object
    buildCall(): object | Promise<any>
    request(args: any[]): object
}