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

import BN = require('bn.js')
import { KeyringContainer, IWallet } from '../../caver-wallet/src'
import { Result } from '../../caver-abi/src'
import { KIP7, KIP37 } from '../../caver-kct/src'
import { TransactionReceipt, CallObject, BlockNumber, PromiEvent, LogsOptions, EventOptions, EventData } from '../../caver-core/src'
import { Transaction, FeeDelegatedTransaction } from '../../caver-transaction/src'
import { AbiItem } from '../../caver-utils/src'

export interface SendOptions {
    from?: string
    gasPrice?: number | string
    gas?: number | string
    data?: string
    feeDelegation?: boolean
    feePayer?: string
    feeRatio?: number | string
}

export interface SendOptionsWithFormatter extends SendOptions {
    contractDeployFormatter: Function
}

export interface ContractOptions extends SendOptions {
    address: string
    jsonInterface: AbiItem[]
}

export interface ContractDeployParams {
    data: string
    arguments?: any[]
}

export interface EstimateGasOptions {
    from?: string
    gas?: number
    value?: number | string | BN
}

export interface ContractMethod {
    call(callback?: (err: Error, result: any) => void): Promise<any>
    call(options: CallObject, callback?: (err: Error, result: any) => void): Promise<any>
    send(options: SendOptions, callback?: (err: Error, transactionHash: string) => void): PromiEvent<Contract>
    sign(options: SendOptions): Promise<Transaction>
    signAsFeePayer(options: SendOptions): Promise<Transaction>
    estimateGas(callback?: (err: Error, gas: number) => void): Promise<number>
    estimateGas(options: EstimateGasOptions, callback?: (err: Error, gas: number) => void): Promise<number>
    encodeABI(): string
}

export class Contract {
    constructor(jsonInterface: AbiItem[], address?: string, options?: SendOptions)

    _address: string
    _jsonInterface: AbiItem[]
    options: ContractOptions
    defaultSendOptions: ContractOptions
    defaultAccount: string | null
    defaultBlock: BlockNumber
    events: any
    methods: any
    _wallet: IWallet

    clone(contractAddress?: string): Contract

    setKeyrings(keyrings: KeyringContainer): void
    setWallet(wallet: IWallet): void
    addAccounts(accounts: string[]): void
    decodeFunctionCall(functionCall: string): Result

    deploy(options: ContractDeployParams): ContractMethod
    deploy(options: SendOptions, byteCode: string, ...args: any[]): Promise<Contract>
    deploy(options: SendOptionsWithFormatter, byteCode: string, ...args: any[]): Promise<any>

    send(sendOptions: SendOptions, functionName: string, ...args: any[]): Promise<TransactionReceipt>

    call(functionName: string, ...args: any[]): Promise<any>
    call(callObject: CallObject, functionName: string, ...args: any[]): Promise<any>

    sign(sendOptions: SendOptions, functionName: string, ...args: any[]): Promise<Transaction>
    signAsFeePayer(sendOptions: SendOptions, functionName: string, ...args: any[]): Promise<FeeDelegatedTransaction>

    once(event: string, callback: (error: Error, event: EventData) => void): void
    once(event: string, options: EventOptions, callback: (error: Error, event: EventData) => void): void
    getPastEvents(event: string, callback?: (error: Error, event: EventData) => void): Promise<EventData[]>
    getPastEvents(event: string, options?: EventOptions, callback?: (error: Error, event: EventData) => void): Promise<EventData[]>
}
