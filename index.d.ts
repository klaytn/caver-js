import AccountKeyFail from './packages/caver-account/src/accountKey/accountKeyFail'
import Account, { IAccount } from './packages/caver-account/src/index'
import KeyringContainer from './packages/caver-wallet'
import { ITransaction } from './packages/caver-transaction'
import { IUtils } from './packages/caver-utils'
import RPC from './packages/caver-rpc'
import KCT from './packages/caver-kct'
import { IABI } from './packages/caver-abi'
import { IContract } from './packages/caver-contract'
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

    account: IAccount
    wallet: KeyringContainer
    transaction: ITransaction
    rpc: RPC
    contract: IContract
    abi: IABI
    kct: KCT
    utils: IUtils
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
