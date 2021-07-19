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
  feeRatio: number 
  gasPrice: number
  gas: number
  data: string
}

export interface DeployOptions extends SendOptions {
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
  from?: string;
  gasPrice?: string;
  gas?: number;
}

export interface ContractSendMethod extends SendData {
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
  deploy(options: DeployOptions, byteCode?: string, ...args: any[]): ContractSendMethod
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
  getPastEvents(
      event: string,
      options: EventOptions,
      callback: (error: Error, event: EventData) => void
  ): Promise<EventData[]>
  getPastEvents(event: string, options: EventOptions): Promise<EventData[]>
  getPastEvents(
      event: string,
      callback: (error: Error, event: EventData) => void
  ): Promise<EventData[]>
}