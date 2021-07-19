import Net from '../../../caver-net/src'
import RpcCallToMethod from '../../../caver-rtm/src'

export default class Personal {
    constructor(...args: any[])

    net: Net

    getAccounts: RpcCallToMethod['personal_listAccounts']
    newAccount: RpcCallToMethod['personal_newAccount']
    unlockAccount: RpcCallToMethod['personal_unlockAccount']
    lockAccount: RpcCallToMethod['personal_lockAccount']
    importRawKey: RpcCallToMethod['personal_importRawKey']
    sendTransaction: RpcCallToMethod['personal_sendTransaction']
    signTransaction: RpcCallToMethod['personal_signTransaction']
    sign: RpcCallToMethod['personal_sign']
    ecRecover: RpcCallToMethod['personal_ecRecover']
    replaceRawKey: RpcCallToMethod['personal_replaceRawKey']
    sendValueTransfer: RpcCallToMethod['personal_sendValueTransfer']
    sendAccountUpdate: RpcCallToMethod['personal_sendAccountUpdate']

    get defaultAccount(): string
    set defaultAccount(val)
    get defaultBlock(): string | number
    set defaultBlock(val)
}