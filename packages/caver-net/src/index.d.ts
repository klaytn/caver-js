import RpcCallToMethod from '../../caver-rtm/src'

export default class Net {
  getId: RpcCallToMethod['net_networkID']
  isListening: RpcCallToMethod['net_listening']
  getPeerCount: RpcCallToMethod['net_peerCount']
  peerCountByType: RpcCallToMethod['net_peerCountByType']
}