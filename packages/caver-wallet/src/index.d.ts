import { IKeyringFactory } from './keyring/keyringFactory'
/**
 * representing a Keyring container which manages keyrings.
 * @class
 */
export default class KeyringContainer {
    keyring: IKeyringFactory
    /**
     * creates a keyringContainer.
     * @param {Array.<Keyring>} keyrings - The keyrings to be managed in KeyringContainer.
     */
    constructor(keyrings: Array<Keyring>)

    /**
     * @type {number}
     */
    get length(): number

    /**
     * generates keyrings in the keyringContainer with randomly generated key pairs.
     *
     * @param {number} numberOfKeyrings The number of keyrings to create.
     * @param {string} [entropy] A random string to increase entropy. If undefined, a random string will be generated using randomHex.
     * @return {Array.<string>}
     */
    generate(numberOfKeyrings: number, entropy?: string): Array<string>

    /**
     * creates a keyring instance with given parameters and adds it to the keyringContainer.
     * KeyringContainer manages Keyring instance using Map <string:Keyring> which has address as key value.
     *
     * @param {string} address The address of the keyring.
     * @param {string|Array.<string>|Array.<Array.<string>>} key Private key string(s) to use in keyring. If different keys are used for each role, key must be defined as a two-dimensional array.
     * @return {Keyring}
     */
    newKeyring(address: string, key: string | Array<string> | Array<Array<string>>): Keyring

    /**
     * updates the keyring inside the keyringContainer.
     * Query the keyring to be updated from keyringContainer with the keyring's address,
     * and an error occurs when the keyring is not found in the keyringContainer.
     *
     * @param {Keyring} keyring The keyring with new key.
     * @return {Keyring}
     */
    updateKeyring(keyring: Keyring): Keyring

    /**
     * Get the keyring in container corresponding to the address
     *
     * @param {string} address The address of keyring to query.
     * @return {Keyring}
     */
    getKeyring(address: string): Keyring

    /**
     * adds a keyring to the keyringContainer.
     *
     * @param {Keyring} keyring A keyring instance to add to keyringContainer.
     * @return {Keyring}
     */
    add(keyring: Keyring): Keyring
    /**
     * deletes the keyring that associates with the given address from keyringContainer.
     *
     * @param {string} address An address of the keyring to be deleted in keyringContainer.
     * @return {boolean}
     */
    remove(address: string): boolean

    /**
     * signs with data and returns the result object that includes `signature`, `message` and `messageHash`
     *
     * @param {string} address An address of keyring in keyringContainer.
     * @param {string} data The data string to sign.
     * @param {number} role A number indicating the role of the key. You can use `caver.wallet.keyring.role`.
     * @param {number} [index] An index of key to use for signing.
     * @return {object}
     */
    signMessage(address: string, data: string, role: number, index?: number): object
    /**
     * signs the transaction using one key and return the transactionHash
     *
     * @param {string} address An address of keyring in keyringContainer.
     * @param {Transaction} transaction A transaction object.
     * @param {number} [index] An index of key to use for signing. If index is undefined, all private keys in keyring will be used.
     * @param {function} [hasher] A function to return hash of transaction.
     * @return {Transaction}
     */
    async sign(address: string, transaction: Transaction, index?: number, hasher?: function): Transaction
    /**
     * signs the transaction as a fee payer using one key and return the transactionHash
     *
     * @param {string} address An address of keyring in keyringContainer.
     * @param {Transaction} transaction A transaction object. This should be `FEE_DELEGATED` type.
     * @param {number} [index] An index of key to use for signing. If index is undefined, all private keys in keyring will be used.
     * @param {function} [hasher] A function to return hash of transaction.
     * @return {Transaction}
     */
    async signAsFeePayer(address: string, transaction: Transaction, index?: number, hasher?: function): Transaction
}

s
