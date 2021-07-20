/*
    Copyright 2021 The caver-js Authors
    This file is part of the caver-js library.

    The caver-js library is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    The caver-js library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with the caver-js. If not, see <http://www.gnu.org/licenses/>.
*/

import BigNumber from 'bignumber.js'
import { Wallet } from '../../..'
import Contract, { SendData, SendOptions } from '../../caver-contract/src'
import { ReceiptObject } from '../../caver-rtm/src'
import { AbiItem } from '../../caver-utils/src'
import { Amount, Data, DetectedObject } from './kip7'

export default class KIP37 extends Contract {
    constructor(tokenAddress?: string, abi?: AbiItem[])

    static byteCode: string

    static create(tokenAddress?: string, abi?: AbiItem[]): KIP37
    static deploy(tokenInfo: object, sendOptions: string | SendOptions, wallet?: Wallet): Promise<SendData>
    static detectInterface(contractAddress: string): Promise<DetectedObject>
    detectInterface(): Promise<DetectedObject>
    supportsInterface(interfaceId: string): Promise<boolean>
    uri(id: Amount): Promise<string>
    totalSupply(id: Amount): Promise<BigNumber>
    balanceOf(account: string, id: Amount): Promise<BigNumber>
    balanceOfBatch(accounts: string[], ids: Amount[]): Promise<BigNumber[]>
    isApprovedForAll(owner: string, operator: string): Promise<boolean>
    paused(id?: Amount): Promise<boolean>
    isPauser(account: string): Promise<boolean>
    isMinter(account: string): Promise<boolean>
    create(id: Amount, initialSupply: Amount, sendParam?: SendOptions): Promise<ReceiptObject>
    create(id: Amount, initialSupply: Amount, uri: string, sendParam?: SendOptions): Promise<ReceiptObject>
    setApprovalForAll(operator: string, approved: boolean, sendParam?: SendOptions): Promise<ReceiptObject>
    safeTransferFrom(from: string, to: string, id: Amount, amount: Amount, sendParam?: SendOptions): Promise<ReceiptObject>
    safeTransferFrom(from: string, to: string, id: Amount, amount: Amount, data: Data, sendParam?: SendOptions): Promise<ReceiptObject>
    safeBatchTransferFrom(from: string, to: string, ids: Amount[], amounts: Amount[], sendParam?: SendOptions): Promise<ReceiptObject>
    safeBatchTransferFrom(
        from: string,
        to: string,
        ids: Amount[],
        amounts: Amount[],
        data: Data,
        sendParam?: SendOptions
    ): Promise<ReceiptObject>
    mint(toList: string | string[], id: Amount, values: Amount | Amount[], sendParam?: SendOptions): Promise<ReceiptObject>
    mintBatch(to: string, ids: Amount[], values: Amount[], sendParam?: SendOptions): Promise<ReceiptObject>
    addMinter(account: string, sendParam?: SendOptions): Promise<ReceiptObject>
    renounceMinter(sendParam?: SendOptions): Promise<ReceiptObject>
    burn(account: string, id: Amount, value: Amount, sendParam?: SendOptions): Promise<ReceiptObject>
    burnBatch(account: string, ids: Amount[], values: Amount[], sendParam?: SendOptions): Promise<ReceiptObject>
    pause(sendParam?: SendOptions): Promise<ReceiptObject>
    pause(id: Amount, sendParam?: SendOptions): Promise<ReceiptObject>
    unpause(sendParam?: SendOptions): Promise<ReceiptObject>
    unpause(id: Amount, sendParam?: SendOptions): Promise<ReceiptObject>
    addPauser(account: string, sendParam?: SendOptions): Promise<ReceiptObject>
    renouncePauser(sendParam?: SendOptions): Promise<ReceiptObject>
}
