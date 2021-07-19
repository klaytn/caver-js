import SignatureData from './signatureData'

export default class PrivateKey {
    constructor(key: string)

    sign(transactionHash: string, chainId: string | number): SignatureData
    signMessage(messageHash: string): SignatureData
    getPublicKey(compressed?: boolean): string
    getDerivedAddress(): string

    get privateKey(): string
    set privateKey(p)
}