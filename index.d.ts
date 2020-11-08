import AccountKeyFail from './packages/caver-account/src/accountKey/accountKeyFail'
import Account, { Account_I } from './packages/caver-account/src/index'
import KeyringContainer from './packages/caver-wallet'
import { Transaction_I } from './packages/caver-transaction'
import Utils from './packages/caver-utils'
import RPC from './packages/caver-rpc'
import KCT from './packages/caver-kct'
import { ABI_I } from './packages/caver-abi'
import { Contract_I } from './packages/caver-contract'
import IPFS from './packages/caver-ipfs'

export class Caver {
    /**
     * @deprecated it is not official property
     */
    static utils: any
    /**
     * @deprecated it is not official property
     */
    static providers: any
    /**
     * @deprecated it is not official property
     */
    static abi: any

    constructor(provider: any, net?: any)

    account: Account_I
    wallet: KeyringContainer
    transaction: Transaction_I
    rpc: RPC
    contract: Contract_I
    abi: ABI_I
    kct: KCT
    utils: Utils
    /**
     * @version since version v1.5.4
     */
    ipfs: IPFS

    /**
     * @deprecated it is not official property
     */
    version: any
    /**
     * @deprecated it is not official property
     */
    helpers: any
    /**
     * @deprecated it is not official property
     */
    Method: any
    /**
     * @deprecated it is not official property
     */
    middleware: any
    /**
     * @deprecated it is not official property
     */
    use: any
    /**
     * @deprecated it is not official property
     */
    setProvider: any
    /**
     * @deprecated since version v1.4.1
     */
    klay: any
}

export default Caver
