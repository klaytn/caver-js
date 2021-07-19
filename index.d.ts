import ABI from './packages/caver-abi/src'
import Account from './packages/caver-account/src'
import BaseContract from './packages/caver-contract/src'
import IHelpers from './packages/caver-core-helpers/src'
import IFormatters from './packages/caver-core-helpers/src/formatters'
import Method from './packages/caver-core-method/src'
import HttpProvider from './packages/caver-core-requestmanager/caver-providers-http/src'
import IpcProvider from './packages/caver-core-requestmanager/caver-providers-ipc/src'
import WebsocketProvider from './packages/caver-core-requestmanager/caver-providers-ws/src'
import IPFS from './packages/caver-ipfs/src'
import KCT from './packages/caver-kct/src'
import Klay from './packages/caver-klay/src'
import Middleware from './packages/caver-middleware/src'
import RPC from './packages/caver-rpc/src'
import { KlayValidator } from './packages/caver-rpc/src/klay'
import ITransaction from './packages/caver-transaction/src'
import Utils from './packages/caver-utils/src'
import KeyringContainer from './packages/caver-wallet/src'
import KeyringFactory from './packages/caver-wallet/src/keyring/keyringFactory'

export class Wallet extends KeyringContainer {
    keyring: typeof KeyringFactory
}

export class Contract extends BaseContract {
    create(): Contract
}

export default class Caver {
    constructor(provider: string, net?: string)

    version: string
    utils: typeof Utils
    abi: ABI
    formatters: IFormatters
    helpers: IHelpers
    Method: typeof Method
    account: typeof Account
    wallet: Wallet
    transaction: ITransaction
    kct: KCT
    klay: Klay
    rpc: RPC
    validator: KlayValidator
    middleware: Middleware
    ipfs: IPFS
    contract: typeof Contract
    providers: {
        WebsocketProvider: WebsocketProvider
        HttpProvider: HttpProvider
        IpcProvider: IpcProvider
    }
}