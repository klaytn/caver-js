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
import Contract, { SendOptions, SendOptionsWithFormatter } from '../../caver-contract/src'
import { TransactionReceipt } from '../../caver-rtm/src'
import { AbiItem } from '../../caver-utils/src'

export interface TokenInfoObject {
    name: string
    symbol: string
    decimals?: number
    initialSupply?: BigNumber | string
}

export interface KIP7DetectedObject {
    IKIP7?: boolean
    IKIP7Metadata?: boolean
    IKIP7Mintable?: boolean
    IKIP7Burnable?: boolean
    IKIP7Pausable?: boolean
}

export type Amount = string | number | BigNumber

export type Data = string | number | number[] | Buffer

export default class KIP7 extends Contract {
    constructor(tokenAddress: string, abi?: AbiItem[])

    static byteCode: string

    static deploy(tokenInfo: TokenInfoObject, sendOptions: string | SendOptionsWithFormatter): Promise<any>
    static deploy(tokenInfo: TokenInfoObject, sendOptions: string | SendOptions): Promise<TransactionReceipt>
    static deploy(tokenInfo: TokenInfoObject, sendOptions: string | SendOptionsWithFormatter, wallet: Wallet): Promise<any> // override from caver-kct
    static deploy(tokenInfo: TokenInfoObject, sendOptions: string | SendOptions, wallet: Wallet): Promise<TransactionReceipt> // override from caver-kct
    static detectInterface(contractAddress: string): Promise<KIP7DetectedObject>
    clone: Contract['clone']
    detectInterface(): Promise<KIP7DetectedObject>
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
    approve(spender: string, amount: Amount, sendParam?: SendOptionsWithFormatter): Promise<any>
    approve(spender: string, amount: Amount, sendParam?: SendOptions): Promise<TransactionReceipt>
    transfer(recipient: string, amount: Amount, sendParam?: SendOptionsWithFormatter): Promise<any>
    transfer(recipient: string, amount: Amount, sendParam?: SendOptions): Promise<TransactionReceipt>
    transferFrom(sender: string, recipient: string, amount: Amount, sendParam?: SendOptionsWithFormatter): Promise<any>
    transferFrom(sender: string, recipient: string, amount: Amount, sendParam?: SendOptions): Promise<TransactionReceipt>
    safeTransfer(recipient: string, amount: Amount, sendParam?: SendOptionsWithFormatter): Promise<any>
    safeTransfer(recipient: string, amount: Amount, sendParam?: SendOptions): Promise<TransactionReceipt>
    safeTransfer(recipient: string, amount: Amount, data: Data, sendParam?: SendOptionsWithFormatter): Promise<any>
    safeTransfer(recipient: string, amount: Amount, data: Data, sendParam?: SendOptions): Promise<TransactionReceipt>
    safeTransferFrom(sender: string, recipient: string, amount: Amount, sendParam?: SendOptionsWithFormatter): Promise<any>
    safeTransferFrom(sender: string, recipient: string, amount: Amount, sendParam?: SendOptions): Promise<TransactionReceipt>
    safeTransferFrom(sender: string, recipient: string, amount: Amount, data: Data, sendParam?: SendOptionsWithFormatter): Promise<any>
    safeTransferFrom(sender: string, recipient: string, amount: Amount, data: Data, sendParam?: SendOptions): Promise<TransactionReceipt>
    mint(account: string, amount: Amount, sendParam?: SendOptionsWithFormatter): Promise<any>
    mint(account: string, amount: Amount, sendParam?: SendOptions): Promise<TransactionReceipt>
    addMinter(account: string, sendParam?: SendOptionsWithFormatter): Promise<any>
    addMinter(account: string, sendParam?: SendOptions): Promise<TransactionReceipt>
    renounceMinter(sendParam?: SendOptionsWithFormatter): Promise<any>
    renounceMinter(sendParam?: SendOptions): Promise<TransactionReceipt>
    burn(amount: Amount, sendParam?: SendOptionsWithFormatter): Promise<any>
    burn(amount: Amount, sendParam?: SendOptions): Promise<TransactionReceipt>
    burnFrom(account: string, amount: Amount, sendParam?: SendOptionsWithFormatter): Promise<any>
    burnFrom(account: string, amount: Amount, sendParam?: SendOptions): Promise<TransactionReceipt>
    addPauser(account: string, sendParam?: SendOptionsWithFormatter): Promise<any>
    addPauser(account: string, sendParam?: SendOptions): Promise<TransactionReceipt>
    pause(sendParam?: SendOptionsWithFormatter): Promise<any>
    pause(sendParam?: SendOptions): Promise<TransactionReceipt>
    unpause(sendParam?: SendOptionsWithFormatter): Promise<any>
    unpause(sendParam?: SendOptions): Promise<TransactionReceipt>
    renouncePauser(sendParam?: SendOptionsWithFormatter): Promise<any>
    renouncePauser(sendParam?: SendOptions): Promise<TransactionReceipt>
}
