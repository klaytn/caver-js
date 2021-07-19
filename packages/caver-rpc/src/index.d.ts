import GovernanceRPC from './governance'
import KlayRPC from './klay'
import NetRPC from './net'

export default class RPC {
    constructor(...args: any[])

    setRequestManager(manager: any): boolean
    setProvider(): void

    klay: KlayRPC
    net: NetRPC
    governance: GovernanceRPC
}