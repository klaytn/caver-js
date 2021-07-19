import Contract from '../../caver-contract/src'
import { AbiItem } from '../../caver-utils/src'

export default class KIP13 extends Contract {
    constructor(contractAddress: string, abi: AbiItem[])

    static isImplementedKIP13Interface(contractAddress: string): Promise<boolean>
    sendQuery(interfaceId: string): Promise<boolean>
}