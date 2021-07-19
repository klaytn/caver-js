import RpcCallToMethod from '../../caver-rtm/src'

export default class NetRPC {
    constructor(...args: any[])

    getNetworkId: RpcCallToMethod['net_networkID']
    isListening: RpcCallToMethod['net_listening']
    getPeerCount: RpcCallToMethod['net_peerCount']
    getPeerCountByType: RpcCallToMethod['net_peerCountByType']
}