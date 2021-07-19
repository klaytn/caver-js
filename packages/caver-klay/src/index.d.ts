import ABI from '../../caver-abi/src'
import Contract from '../../caver-contract/src'
import KIP17 from '../../caver-kct/src/kip17'
import KIP7 from '../../caver-kct/src/kip7'
import Net from '../../caver-net/src'
import KlayRPC from '../../caver-rpc/src/klay'
import { TransactionObject } from '../../caver-rtm/src'
import Utils from '../../caver-utils/src'
import Accounts from '../caver-klay-accounts/src'
import Personal from '../caver-klay-personal/src'
import { getNetworkType } from './getNetworkType'

export class KlayContract extends Contract {}

export class KlayNet extends Net{
    getNetworkType: typeof getNetworkType
}

// export default class Klay extends RpcCallToMethod { // For all RPC Methods
export default class Klay extends KlayRPC {
    decodeTransaction(rawTransaction: string, type?: string): TransactionObject
    net: KlayNet
    accounts: Accounts
    personal: Personal
    Contract: KlayContract
    /** @deprecated */
    KIP7: typeof KIP7
    KIP17: typeof KIP17
    Iban: typeof Utils['Iban']
    abi: ABI

    get defaultAccount(): string
    set defaultAccount(val)
    get defaultBlock(): string | number
    set defaultBlock(val)
}