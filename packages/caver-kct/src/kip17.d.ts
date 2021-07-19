import BigNumber from 'bignumber.js'
import Contract, { SendData, SendOptions } from '../../caver-contract/src'
import { ReceiptObject } from '../../caver-rtm/src'
import { AbiItem } from '../../caver-utils/src'
import { Amount, Data, DetectedObject, TokenInfoObject } from './kip7'

export default class KIP17 extends Contract {
    constructor(tokenAddress: string, abi?: AbiItem[])

    static byteCode: string

    static deploy(tokenInfo: TokenInfoObject, sendOptions?: string | SendOptions): Promise<SendData>
    static detectInterface(contractAddress: string): Promise<DetectedObject>
    clone: Contract['clone']
    detectInterface(): Promise<DetectedObject>
    supportsInterface(interfaceId: string): Promise<boolean>
    name(): Promise<string>
    symbol(): Promise<string>
    tokenURI(tokenId: Amount): Promise<string>
    totalSupply(): Promise<BigNumber>
    tokenOfOwnerByIndex(owner: string, index: string | number | BigNumber): Promise<BigNumber>
    tokenByIndex(index: string | number | BigNumber): Promise<BigNumber>
    balanceOf(account: string): Promise<BigNumber>
    ownerOf(tokenId: Amount): Promise<string>
    getApproved(tokenId: Amount): Promise<string>
    isApprovedForAll(owner: string, operator: string): Promise<boolean>
    isMinter(account: string): Promise<boolean>
    paused(): Promise<boolean>
    isPauser(account: string): Promise<boolean>
    approve(to: string, tokenId: Amount, sendParam?: SendOptions): Promise<ReceiptObject>
    setApprovalForAll(to: string, approved: boolean, sendParam?: SendOptions): Promise<ReceiptObject>
    transferFrom(from: string, to: string, tokenId: Amount, sendParam?: SendOptions): Promise<ReceiptObject>
    safeTransferFrom(from: string, to: string, tokenId: Amount, sendParam?: SendOptions): Promise<ReceiptObject>
    safeTransferFrom(from: string, to: string, tokenId: Amount, data: Data, sendParam?: SendOptions): Promise<ReceiptObject>
    addMinter(account: string, sendParam?: SendOptions): Promise<ReceiptObject>
    renounceMinter(sendParam?: SendOptions): Promise<ReceiptObject>
    mint(to: string, tokenId: Amount, sendParam?: SendOptions): Promise<ReceiptObject>
    mintWithTokenURI(to: string, tokenId: Amount, tokenURI: string, sendParam?: SendOptions): Promise<ReceiptObject>
    burn(tokenId: Amount, sendParam?: SendOptions): Promise<ReceiptObject>
    pause(sendParam?: SendOptions): Promise<ReceiptObject>
    unpause(sendParam?: SendOptions): Promise<ReceiptObject>
    addPauser(account: string, sendParam?: SendOptions): Promise<ReceiptObject>
    renouncePauser(sendParam?: SendOptions): Promise<ReceiptObject>
}