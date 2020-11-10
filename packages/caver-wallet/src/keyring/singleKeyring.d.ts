import AbstractKeyring from './abstractKeyring'

export interface ISingleKeyring extends AbstractKeyring {
    /**
     * creates a SingleKeyring.
     * @param {string} address - The address of keyring.
     * @param {string|PrivateKey} key - The key to use in SingleKeyring.
     */
    new (address: string, key: string | PrivateKey): SingleKeyring
}

/**
 * representing a Keyring which includes `address` and a `private key`.
 * @class
 */
export default class SingleKeyring extends AbstractKeyring {
    /**
     * creates a SingleKeyring.
     * @param {string} address - The address of keyring.
     * @param {string|PrivateKey} key - The key to use in SingleKeyring.
     */
    constructor(address: string, key: string | PrivateKey)

    /**
     * @type {PrivateKey}
     */
    get key(): PrivateKey

    set key(keyInput: PrivateKey)

    /**
     * returns public key string.
     *
     * @return {string}
     */
    getPublicKey(): string

    /**
     * returns a copied singleKeyring instance
     *
     * @return {SingleKeyring}
     */
    copy(): SingleKeyring

    /**
     * signs with transactionHash with a key and returns signature(s).
     *
     * @param {string} transactionHash The hash of transaction.
     * @param {string|number} chainId The chainId specific to the network.
     * @param {number} role A number indicating the role of the key. You can use `caver.wallet.keyring.role`.
     * @param {number} [index] The index of the key to be used. If index is undefined, all private keys in keyring will be used.
     * @return {Array.<string>|Array.<Array.<string>>}
     */
    sign(transactionHash: string, chainId: string | number, role: number, index?: number): Array<string> | Array<Array<string>>

    /**
     * signs with hashed message and returns result object that includes `signatures`, `message` and `messageHash`
     *
     * @param {string} message The message string to sign.
     * @param {number} role A number indicating the role of the key. You can use `caver.wallet.keyring.role`.
     * @param {number} [index] The index of the key to be used.
     * @return {object}
     */
    signMessage(message: string, role: number, index?: number): object

    /**
     * returns keys by role. If the key of the role passed as parameter is empty, the default key is returned.
     *
     * @param {number} role A number indicating the role of the key. You can use `caver.wallet.keyring.role`.
     * @return {Array.<PrivateKey>}
     */
    getKeyByRole(role: number): Array<PrivateKey>

    /**
     * returns KlaytnWalletKey format. If keyring uses more than one private key, this function will throw error.
     *
     * @return {string}
     */
    getKlaytnWalletKey(): string

    /**
     * returns an instance of Account.
     *
     * @return {Account}
     */
    toAccount(): Account

    /**
     * encrypts a keyring and returns a keystore v4 object.
     *
     * @param {string} password The password to be used for encryption. The encrypted key store can be decrypted with this password.
     * @param {object} options The options to use when encrypt a keyring. Also address can be defined specifically in options object.
     * @return {object}
     */
    /**
     * options can include below
     * {
     *   salt: ...,
     *   iv: ...,
     *   kdf: ...,
     *   dklen: ...,
     *   c: ...,
     *   n: ...,
     *   r: ...,
     *   p: ...,
     *   cipher: ...,
     *   uuid: ...,
     *   cipher: ...,
     * }
     */
    encrypt(password: string, options: object = {}): object

    /**
     * encrypts a keyring and returns a keystore v3 object.
     *
     * @param {string} password The password to be used for keyring encryption. The encrypted key store can be decrypted with this password.
     * @param {object} options The options to use when encrypt a keyring. See `keyring.encrypt` for more detail about options.
     * @return {object}
     */
    encryptV3(password: string, options?: object): object

    /**
     * returns true if keyring has decoupled key.
     *
     * @return {boolean}
     */
    isDecoupled(): boolean
}
