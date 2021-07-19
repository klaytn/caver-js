import { Keyring } from '../../../caver-wallet/src/keyring/keyringFactory'
import SignatureData from '../../../caver-wallet/src/keyring/signatureData'
import AbstractTransaction, { CreateTransactionOptions } from './abstractTransaction'

export default class AbstractFeeDelegatedTransaction extends AbstractTransaction {
    constructor(typeString: string, createTxObj: CreateTransactionOptions)

    signAsFeePayer(key: string | Keyring, index?: number, hasher?: Function): Promise<AbstractFeeDelegatedTransaction>
    appendFeePayerSignatures(signatures: string[] | string[][] | SignatureData | SignatureData[]): void
    combineSignedRawTransactions(rlpEncodedTxs: string[]): string
    getSenderTxHash(): string
    getRLPEncodingForFeePayerSignature(): string
    recoverFeePayerPublicKeys(): string[]

    get feePayer(): string
    set feePayer(f)
    get feePayerSignatures(): string[] | string[][] | SignatureData | SignatureData[]
    set feePayerSignatures(sigs)
}