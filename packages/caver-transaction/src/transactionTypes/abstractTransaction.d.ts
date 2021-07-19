import Account from '../../../caver-account/src'
import { KlaytnCall } from '../../../caver-rpc/src/klay'
import { Keyring } from '../../../caver-wallet/src/keyring/keyringFactory'
import SignatureData from '../../../caver-wallet/src/keyring/signatureData'

export interface CreateTransactionOptions {
    account?: Account
    from?: string
    to?: string
    value?: string | number
    input?: string
    nonce?: string
    gas?: string | number
    gasPrice?: string
    chainId?: string
    feePayer?: string
}

export default class AbstractTransaction {
    constructor(typeString: string, createTxObj: CreateTransactionOptions)

    static _klaytnCall: KlaytnCall

    getRLPEncoding(): string
    getCommonRLPEncodingForSignature(): string
    sign(key: string | Keyring, index?: number, hasher?: Function): Promise<AbstractTransaction>
    appendSignatures(signatures: string[] | string[][] | SignatureData | SignatureData[]): void
    combineSignedRawTransactions(rlpEncodedTxs: string[]): string
    getRawTransaction(): string
    getTransactionHash(): string
    getSenderTxHash(): string
    getRLPEncodingForSignature(): string
    recoverPublicKeys(): string[]
    fillTransaction(): Promise<void>
    validateOptionalValues(): void

    get type(): string
    get from(): string
    set from(address)
    get nonce(): string
    set nonce(n)
    get gas(): string
    set gas(g)
    get gasPrice(): string
    set gasPrice(g)
    get chainId(): string
    set chainId(ch)
    get signatures(): string[] | string[][] | SignatureData | SignatureData[]
    set signatures(sigs)
}