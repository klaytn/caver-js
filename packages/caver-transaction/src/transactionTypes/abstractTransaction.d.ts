
/**
 * Abstract class that implements common logic for each transaction type.
 * @class
 */
export default class AbstractTransaction {

    /**
     * Abstract class that implements common logic for each transaction type.
     * In this constructor, type, tag, nonce, gasPrice, chainId, gas and signatures are set as transaction member variables.
     *
     * @constructor
     * @param {string} typeString - The type string of transaction.
     * @param {object} createTxObj - The parameters to create a transaction instance.
     */
    constructor(typeString: string, createTxObj: object)

    /**
     * @type {string}
     */
    get type(): string

    /**
     * @type {string}
     */
    get from(): string

    set from(address: string)

    /**
     * @type {string}
     */
    get nonce(): string

    set nonce(n: string)

    /**
     * @type {string}
     */
    get gas(): string

    set gas(g: string)

    /**
     * @type {string}
     */
    get gasPrice(): string

    set gasPrice(g: string)

    /**
     * @type {string}
     */
    get chainId(): string

    set chainId(ch: string)

    /**
     * @type {Array<string>|Array.<Array<string>>}
     */
    get signatures(): Array<string> | Array.<Array<string>>

    set signatures(sigs: Array<string> | Array.<Array<string>>)

    /**
     * Signs to the transaction with private key(s) in the `key`.
     * @async
     * @param {Keyring|string} key - The instance of Keyring, private key string or KlaytnWalletKey string.
     * @param {number} [index] - The index of private key to use. If index is undefined, all private keys in keyring will be used.
     * @param {function} [hasher] - The function to get hash of transaction. In order to use a custom hasher, the index must be defined.
     * @return {Transaction}
     */
    async sign(key: Keyring | string, index?: number, hasher?: Function = TransactionHasher.getHashForSignature): Transaction

    /**
     * Appends signatures to the transaction.
     *
     * @param {SignatureData|Array.<SignatureData>|Array.<string>|Array.<Array.<string>>} signatures - An array of signatures to append to the transaction.
     *                                                      One signature can be defined in the form of a one-dimensional array or two-dimensional array,
     *                                                      and more than one signatures should be defined in the form of a two-dimensional array.
     */
    appendSignatures(signatures: SignatureData | Array<SignatureData> | Array<string> | Array<Array<string>>): void

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
     * Returns RawTransaction(RLP-encoded transaction string)
     *
     * @return {string}
     */
    getRawTransaction(): string

    /**
     * Returns a hash string of transaction
     *
     * @return {string}
     */
    getTransactionHash(): string

    /**
     * Returns a senderTxHash of transaction
     *
     * @return {string}
     */
    getSenderTxHash(): string

    /**
     * Returns an RLP-encoded transaction string for making signature
     *
     * @return {string}
     */
    getRLPEncodingForSignature(): string

    /**
     * Returns the RLP-encoded string to make the signature of this transaction.
     * This method has to be overrided in classes which extends AbstractTransaction.
     * getCommonRLPEncodingForSignature is used in getRLPEncodingForSignature.
     *
     * @return {string}
     */
    // eslint-disable-next-line class-methods-use-this
    getCommonRLPEncodingForSignature(): string

    /**
     * Fills empty optional transaction properties(gasPrice, nonce, chainId).
     */
    async fillTransaction(): Promise<void>

    /**
     * Checks that member variables that can be defined by the user are defined.
     * If there is an undefined variable, an error occurs.
     */
    validateOptionalValues(): void
}
