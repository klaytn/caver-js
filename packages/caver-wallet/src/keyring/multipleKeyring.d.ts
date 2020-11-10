

import AbstractKeyring from './abstractKeyring'

/**
 * representing a Keyring which includes `address` and `private keys`.
 * @class
 */
export interface MultipleKeyring_I extends AbstractKeyring {
    /**
     * creates a MultipleKeyring.
     * @param {string} address - The address of keyring.
     * @param {Array.<string>|Array.<PrivateKey>} keys - The keys to use in MultipleKeyring.
     */
    new(address: string, keys: Array<string> | Array<PrivateKey>): MultipleKeyring

}


/**
 * representing a Keyring which includes `address` and `private keys`.
 * @class
 */
export default class MultipleKeyring extends AbstractKeyring {
    /**
     * creates a MultipleKeyring.
     * @param {string} address - The address of keyring.
     * @param {Array.<string>|Array.<PrivateKey>} keys - The keys to use in MultipleKeyring.
     */
    constructor(address: string, keys: Array<string> | Array<PrivateKey>)

    /**
     * @type {Array.<PrivateKey>}
     */
    get keys(): Array.<PrivateKey>

    set keys(keyInput: Array.<PrivateKey>)

    /**
     * returns public key strings.
     *
     * @return {Array.<string>}
     */
    getPublicKey(): Array<string>

    /**
     * returns a copied multipleKeyring instance
     *
     * @return {MultipleKeyring}
     */
    copy(): MultipleKeyring

    /**
     * signs with transactionHash with key and returns signature(s).
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
     * returns an instance of Account.
     *
     * @param {WeightedMultiSigOptions} [options] The options that includes 'threshold' and 'weight'. This is only necessary when keyring use multiple private keys.
     * @return {Account}
     */
    toAccount(options?: WeightedMultiSigOptions): Account

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
    encrypt(password, options = {}): {
        version: any;
        id: any;
        address: any;
    }
}

