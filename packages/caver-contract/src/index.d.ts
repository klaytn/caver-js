export interface Contract_I {
    setProvider: (provider: any, accounts: any) => void

    new(jsonInterface: Array<any>, address?: string, options?: object): Contract
}


/**
 * Should be called to create new contract instance
 *
 * @method Contract
 * @constructor
 * @param {Array} jsonInterface
 * @param {String} address
 * @param {Object} options
 */

/**
 * let myContract = new cav.klay.Contract([...], '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe', {
 *   from: '0x1234567890123456789012345678901234567891', // default from address
 *   gasPrice: '20000000000', // default gas price in wei, 20 gwei in this case
 *   data: '',(bytecode, when contract deploy)
 *   gas: 200000, (gas limit)
 * });
 */
export default class Contract {
    static setProvider: (provider: any, accounts: any) => void

    constructor(jsonInterface: Array<any>, address?: string, options?: object)

    currentProvider: any
    options: {
        address: string
        jsonInterface: Array<any>
        from: string
        gasPrice: string
        gas: number
        data: string
    }
    clone: (contractAddress?: string) => any
    async deploy: (options: object) => Promise<object>
    once: (event: string, options: any, callback: Function, ...args: any[]) => any
    events: any
    getPastEvents(...args: any[]): any
}
