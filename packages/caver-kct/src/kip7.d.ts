import BigNumber from 'bignumber.js'
import { Wallet } from '../../..'
import Contract, { SendData, SendOptions } from '../../caver-contract/src'
import { ReceiptObject } from '../../caver-rtm/src'
import { AbiItem } from '../../caver-utils/src'

export interface TokenInfoObject {
    name: string
    symbol: string
    decimals?: number
    initialSupply?: BigNumber | string
}

export interface DetectedObject {
    IKIP7?: boolean
    IKIP7Metadata?: boolean
    IKIP7Mintable?: boolean
    IKIP7Burnable?: boolean
    IKIP7Pausable?: boolean
    IKIP17?: boolean
    IKIP17Metadata?: boolean
    IKIP17Enumerable?: boolean
    IKIP17Mintable?: boolean
    IKIP17MetadataMintable?: boolean
    IKIP17Burnable?: boolean
    IKIP17Pausable?: boolean
    IKIP37: boolean
    IKIP37Metadata: boolean
    IKIP37Mintable: boolean
    IKIP37Burnable: boolean
    IKIP37Pausable: boolean
}

export type Amount =
    | string
    | number
    | BigNumber

export type Data =
    | string
    | number
    | number[]
    | Buffer

export default class KIP7 extends Contract {
    constructor(tokenAddress: string, abi?: AbiItem[])

    static byteCode: string

    static deploy(tokenInfo: TokenInfoObject, sendOptions: string | SendOptions): Promise<SendData>
    static deploy(tokenInfo: TokenInfoObject, sendOptions: string | SendOptions, wallet: Wallet): Promise<SendData> // override from caver-kct
    static detectInterface(contractAddress: string): Promise<DetectedObject>
    clone: Contract['clone']
    detectInterface(): Promise<DetectedObject>
    supportsInterface(interfaceId: string): Promise<boolean>
    name(): Promise<string>
    symbol(): Promise<string>
    decimals(): Promise<number>
    totalSupply(): Promise<BigNumber>
    balanceOf(account: string): Promise<BigNumber>
    allowance(owner: string, spender: string): Promise<BigNumber>
    isMinter(account: string): Promise<boolean>
    isPauser(account: string): Promise<boolean>
    paused(): Promise<boolean>
    approve(spender: string, amount: Amount, sendParam?: SendOptions): Promise<ReceiptObject>
    transfer(recipient: string, amount: Amount, sendParam?: SendOptions): Promise<ReceiptObject>
    transferFrom(sender: string, recipient: string, amount: Amount, sendParam?: SendOptions): Promise<ReceiptObject>
    safeTransfer(recipient: string, amount: Amount, sendParam?: SendOptions): Promise<ReceiptObject>
    safeTransfer(recipient: string, amount: Amount, data: Data, sendParam?: SendOptions): Promise<ReceiptObject>
    safeTransferFrom(sender: string, recipient: string, amount: Amount, sendParam?: SendOptions): Promise<ReceiptObject>
    safeTransferFrom(sender: string, recipient: string, amount: Amount, data: Data, sendParam?: SendOptions): Promise<ReceiptObject>
    mint(account: string, amount: Amount, sendParam?: SendOptions): Promise<ReceiptObject>
    addMinter(account: string, sendParam?: SendOptions): Promise<ReceiptObject>
    renounceMinter(sendParam?: SendOptions): Promise<ReceiptObject>
    burn(amount: Amount, sendParam?: SendOptions): Promise<ReceiptObject>
    burnFrom(account: string, amount: Amount, sendParam?: SendOptions): Promise<ReceiptObject>
    addPauser(account: string, sendParam?: SendOptions): Promise<ReceiptObject>
    pause(sendParam?: SendOptions): Promise<ReceiptObject>
    unpause(sendParam?: SendOptions): Promise<ReceiptObject>
    renouncePauser(sendParam?: SendOptions): Promise<ReceiptObject>
}