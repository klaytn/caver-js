
import TransactionHasher from '../transactionHasher/transactionHasher'
import AbstractTransaction from './abstractTransaction'
import Keyring from '../../../caver-wallet/src/keyring/keyringFactory'
import SignatureData from '../../../caver-wallet/src/keyring/signatureData'

/**
 * Abstract class that implements common logic for each fee delegated transaction type.
 * @class
 */
export default class AbstractFeeDelegatedTransaction extends AbstractTransaction {
    /**
     * Abstract class that implements common logic for each fee-delegated transaction type.
     * In this constructor, feePayer and feePayerSignatures are set as transaction member variables.
     *
     * @constructor
     * @param {string} typeString - The type string of transaction.
     * @param {object} createTxObj - The parameters to create an instance of transaction.
     */
    constructor(typeString: string, createTxObj: object)

    /**
     * @type {string}
     */
    get feePayer(): string

    set feePayer(f: string)

    /**
     * @type {Array.<Array.<string>>}
     */
    get feePayerSignatures(): Array<Array<string>>
    set feePayerSignatures(sigs: Array<Array<string>>)

    /**
     * Signs to the transaction with private key(s) in `key` as a fee payer.
     * @async
     * @param {Keyring|string} key - The instance of Keyring, private key string or KlaytnWalletKey string.
     * @param {number} [index] - The index of private key to use. If index is undefined, all private keys in keyring will be used.
     * @param {function} [hasher] - The function to get the transaction hash.
     * @return {Transaction}
     */
    async signAsFeePayer(key: Keyring | string, index?: number, hasher?: function = TransactionHasher.getHashForFeePayerSignature): Transaction

    /**
     * Appends feePayerSignatures to the transaction.
     *
     * @param {SignatureData|Array.<SignatureData>|Array.<string>|Array.<Array.<string>>} signatures - An array of feePayerSignatures to append to the transaction.
     *                                                      One feePayerSignature can be defined in the form of a one-dimensional array or two-dimensional array,
     *                                                      and more than one feePayerSignatures should be defined in the form of a two-dimensional array.
     */
    appendFeePayerSignatures(signatures: SignatureData | Array<SignatureData> | Array<string> | Array<Array<string>>)

    /**
     * Combines RLP-encoded transactions (rawTransaction) to the transaction from RLP-encoded transaction strings and returns a single transaction with all signatures combined.
     * When combining the signatures into a transaction instance,
     * an error is thrown if the decoded transaction contains different value except signatures.
     *
     * @param {Array.<string>} rlpEncodedTxs - An array of RLP-encoded transaction strings.
     * @return {string}
     */
    combineSignedRawTransactions(rlpEncodedTxs: Array<string>): string

    /**
     * Returns a senderTxHash of transaction
     *
     * @return {string}
     */
    getSenderTxHash(): string

    /**
     * Returns an RLP-encoded transaction string for making signature as a fee payer
     *
     * @return {string}
     */
    getRLPEncodingForFeePayerSignature(): string
}

