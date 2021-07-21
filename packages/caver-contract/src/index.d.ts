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

import { Wallet } from '../../..'
import { Result } from '../../caver-abi/src'
import { KIP37 } from '../../caver-kct/src'
import KIP7 from '../../caver-kct/src/kip7'
import { AbiItem } from '../../caver-utils/src'
import KeyringContainer from '../../caver-wallet/src'

export interface ContractOptions {
    address: string
    jsonInterface: AbiItem[]
    from: string
    feePayer: string
    feeDelegation: boolean
    feeRatio: number | string
    gasPrice: number | string
    gas: number | string
    data: string
}

export interface ContractDeployParams extends SendOptions {
    data?: string
    arguments?: any[]
}

export interface SendOptions {
    from?: string
    feeDelegation?: boolean
    feePayer?: string
    feeRatio?: number
    gas?: number | string
    contractDeployFormatter?: Function
}

export interface CallOptions {
    from?: string
    gasPrice?: string
    gas?: number
}

export interface ContractMethod extends SendData {
    send: Contract['send']
    call: Contract['call']
    sign: Contract['sign']
    signAsFeePayer: Contract['signAsFeePayer']
}

export interface SendData {
    from?: string
    status?: string
    type?: string
    feePayer?: string
    contractAddress?: string
    feeRatio?: number
    options?: {
        address: string
    }
}

export interface EventOptions {
    filter?: object
    fromBlock?: number
    toBlock?: number
    topics?: string[]
}

export interface EventData {
    address?: string
    blockNumber?: number
    transactionHash?: string
    transactionIndex?: number
    blockHash?: string
    logIndex?: number
    id?: string
    returnValues?: {
        operator?: string
        from?: string
        to?: string
        id?: string
        ids?: string[]
        value?: string
        values?: string[]
        account?: string
        approved?: boolean
        tokenId?: string
    }
    event?: string
    signature?: string
    raw?: {
        data?: string
        topics?: string[]
    }
}

export default class Contract {
    constructor(jsonInterface: AbiItem[], address?: string, options?: ContractOptions)

    options: ContractOptions
    defaultSendOptions: ContractOptions
    defaultAccount: string | null
    defaultBlock: string
    events: any
    methods: any
    _wallet: Wallet

    setKeyrings(keyrings: KeyringContainer): void
    setWallet(wallet: Wallet): void
    addAccounts(accounts: string[]): void
    decodeFunctionCall(functionCall: string): Result
    deploy(options: ContractDeployParams, byteCode?: string, ...args: any[]): ContractMethod
    send(sendOptions: SendOptions, functionName?: string, ...args: any[]): Promise<SendData>
    call(functionName: string, ...args: any[]): Promise<any>
    call(callObject: CallOptions, functionName: string, ...args: any[]): Promise<any>
    sign(sendOptions: SendOptions, functionName?: string, ...args: any[]): Promise<any>
    signAsFeePayer(sendOptions: SendOptions, functionName?: string, ...args: any[]): Promise<any>
    clone(contractAddress?: object): Contract
    clone(contractAddress?: string): KIP7 // override from kip7
    clone(tokenAddress?: string): KIP37 // override from kip37
    once(event: string, callback: (error: Error, event: EventData) => void): void
    once(event: string, options: EventOptions, callback: (error: Error, event: EventData) => void): void
    getPastEvents(event: string): Promise<EventData[]>
    getPastEvents(event: string, options: EventOptions, callback: (error: Error, event: EventData) => void): Promise<EventData[]>
    getPastEvents(event: string, options: EventOptions): Promise<EventData[]>
    getPastEvents(event: string, callback: (error: Error, event: EventData) => void): Promise<EventData[]>
}
