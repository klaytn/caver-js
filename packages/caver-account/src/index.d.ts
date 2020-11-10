import AccountKeyDecoder, { IAccountKeyDecoder } from './accountKey/accountKeyDecoder'
import AccountKeyFail, { IAccountKeyFail } from './accountKey/accountKeyFail'
import AccountKeyHelper from './accountKey/accountKeyHelper'
import AccountKeyLegacy, { IAccountKeyLegacy } from './accountKey/accountKeyLegacy'
import AccountKeyPublic, { IAccountKeyPublic } from './accountKey/accountKeyPublic'
import AccountKeyRoleBased, { IAccountKeyRoleBased } from './accountKey/accountKeyRoleBased'
import AccountKeyWeightedMultiSig, { IAccountKeyWeightedMultiSig } from './accountKey/accountKeyWeightedMultiSig'
import WeightedMultiSigOptions, { IWeightedMultiSigOptions } from './accountKey/weightedMultiSigOptions'
import WeightedPublicKey, { IWeightedPublicKey } from './accountKey/weightedPublicKey'

export interface IAccount {
    /**
     * creates an Account instance
     *
     * `caver.account.create('0x${address in hex}', '0x{public key}')`
     * `caver.account.create('0x${address in hex}', ['0x{public key}', '0x{public key}'], { threshold: 1, weight: [1,1] })`
     * `caver.account.create('0x${address in hex}', [['0x{public key}'], ['0x{public key}', '0x{public key}'], ['0x{public key}']], [{}, { threshold: 1, weight: [1,1] }, {}])`
     *
     * @param {string} address The address of Account.
     * @param {string|Array.<string>|Array.<Array.<string>>} accountKey The accountKey value of Account. Depending on this, Account's accountKey will be AccountKeyLegacy / AccountKeyPublic / AccountKeyFail / AccountKeyWeightedMultiSig / AccountKeyRoleBased.
     * @param {WeightedMultiSigOptions|Array.<WeightedMultiSigOptions>} [options] The options that includes 'threshold' and 'weight'. This is only necessary if AccountKeyWeightedMultiSig or AccountKeyRoleBased.
     * @return {Account}
     */
    create: (
        address: string,
        accountKey: string | Array<string> | Array<Array<string>>,
        options?: WeightedMultiSigOptions | Array<WeightedMultiSigOptions>
    ) => Account

    /**
     * creates an Account instance from RLP-encoded account key
     *
     * @param {string} address The address of Account.
     * @param {string} rlpEncodedKey The RLP-encoded accountKey string.
     * @return {Account}
     */
    createFromRLPEncoding: (address: string, rlpEncodedKey: string) => Account

    /**
     * creates an Account instance which has AccountKeyLegacy as an accountKey
     *
     * @param {string} address The address of Account.
     * @return {Account}
     */
    createWithAccountKeyLegacy: (address: string) => Account

    /**
     * creates an Account instance which has AccountKeyPublic as an accountKey
     *
     * @param {string} address The address of Account.
     * @param {string} publicKey The public key string.
     * @return {Account}
     */
    createWithAccountKeyPublic: (address: string, publicKey: string) => Account

    /**
     * creates an Account instance which has AccountKeyFail as an accountKey
     *
     * @param {string} address The address of Account.
     * @return {Account}
     */
    createWithAccountKeyFail: (address: string) => Account

    /**
     * creates an Account instance which has AccountKeyWeightedMultiSig as an accountKey
     *
     * @param {string} address The address of Account.
     * @param {Array} publicKeyArray The array that includes multiple public key strings.
     * @param {Object} [options] The object that includes threshold and weight array.
     * @return {Account}
     */
    createWithAccountKeyWeightedMultiSig: (address: string, publicKeyArray: string[], options?: WeightedMultiSigOptions | object) => Account

    /**
     * creates an Account instance which has AccountKeyRoleBased as an accountKey
     *
     * @param {string} address The address of Account.
     * @param {Array} roledBasedPublicKeyArray A two-dimensional array containing arrays of public key strings for each role.
     * @param {Array} [options] An array that contains objects with threshold and weight array defined for each role.
     * @return {Account}
     */
    createWithAccountKeyRoleBased: (
        address: string,
        roledBasedPublicKeyArray: Array<AccountKeyLegacy | AccountKeyFail | Array<string>>,
        options?: Array<WeightedMultiSigOptions | object>
    ) => Account
    accountKey: {
        decode: (
            rlpEncodedKey: string
        ) => AccountKeyLegacy | AccountKeyPublic | AccountKeyFail | AccountKeyWeightedMultiSig | AccountKeyRoleBased
        accountKeyLegacy: IAccountKeyLegacy
        accountKeyPublic: IAccountKeyPublic
        accountKeyFail: IAccountKeyFail
        accountKeyWeightedMultiSig: IAccountKeyWeightedMultiSig
        accountKeyRoleBased: IAccountKeyRoleBased
        weightedPublicKey: IWeightedPublicKey
    }

    weightedMultiSigOptions: IWeightedMultiSigOptions

    /**
     * Create an account.
     * @param {string} address - The address of account.
     * @param {AccountKeyLegacy|AccountKeyPublic|AccountKeyFail|AccountKeyWeightedMultiSig|AccountKeyRoleBased} accountKey - The accountKey of account.
     */
    new (
        address: string,
        accountKey: AccountKeyLegacy | AccountKeyPublic | AccountKeyFail | AccountKeyWeightedMultiSig | AccountKeyRoleBased
    ): Account
}

/**
 * Representing an Account which includes information for account update.
 * @class
 */
export default class Account {
    /**
     * creates an Account instance
     *
     * `caver.account.create('0x${address in hex}', '0x{public key}')`
     * `caver.account.create('0x${address in hex}', ['0x{public key}', '0x{public key}'], { threshold: 1, weight: [1,1] })`
     * `caver.account.create('0x${address in hex}', [['0x{public key}'], ['0x{public key}', '0x{public key}'], ['0x{public key}']], [{}, { threshold: 1, weight: [1,1] }, {}])`
     *
     * @param {string} address The address of Account.
     * @param {string|Array.<string>|Array.<Array.<string>>} accountKey The accountKey value of Account. Depending on this, Account's accountKey will be AccountKeyLegacy / AccountKeyPublic / AccountKeyFail / AccountKeyWeightedMultiSig / AccountKeyRoleBased.
     * @param {WeightedMultiSigOptions|Array.<WeightedMultiSigOptions>} [options] The options that includes 'threshold' and 'weight'. This is only necessary if AccountKeyWeightedMultiSig or AccountKeyRoleBased.
     * @return {Account}
     */
    static create: (
        address: string,
        accountKey: string | Array<string> | Array<Array<string>>,
        options?: WeightedMultiSigOptions | Array<WeightedMultiSigOptions>
    ) => Account

    /**
     * creates an Account instance from RLP-encoded account key
     *
     * @param {string} address The address of Account.
     * @param {string} rlpEncodedKey The RLP-encoded accountKey string.
     * @return {Account}
     */
    static createFromRLPEncoding: (address: string, rlpEncodedKey: string) => Account

    /**
     * creates an Account instance which has AccountKeyLegacy as an accountKey
     *
     * @param {string} address The address of Account.
     * @return {Account}
     */
    static createWithAccountKeyLegacy: (address: string) => Account

    /**
     * creates an Account instance which has AccountKeyPublic as an accountKey
     *
     * @param {string} address The address of Account.
     * @param {string} publicKey The public key string.
     * @return {Account}
     */
    static createWithAccountKeyPublic: (address: string, publicKey: string) => Account

    /**
     * creates an Account instance which has AccountKeyFail as an accountKey
     *
     * @param {string} address The address of Account.
     * @return {Account}
     */
    static createWithAccountKeyFail: (address: string) => Account

    /**
     * creates an Account instance which has AccountKeyWeightedMultiSig as an accountKey
     *
     * @param {string} address The address of Account.
     * @param {Array} publicKeyArray The array that includes multiple public key strings.
     * @param {Object} [options] The object that includes threshold and weight array.
     * @return {Account}
     */
    static createWithAccountKeyWeightedMultiSig: (
        address: string,
        publicKeyArray: string[],
        options?: WeightedMultiSigOptions | object
    ) => Account

    /**
     * creates an Account instance which has AccountKeyRoleBased as an accountKey
     *
     * @param {string} address The address of Account.
     * @param {Array} roledBasedPublicKeyArray A two-dimensional array containing arrays of public key strings for each role.
     * @param {Array} [options] An array that contains objects with threshold and weight array defined for each role.
     * @return {Account}
     */
    static createWithAccountKeyRoleBased: (
        address: string,
        roledBasedPublicKeyArray: Array<AccountKeyLegacy | AccountKeyFail | Array<string>>,
        options?: Array<WeightedMultiSigOptions | object>
    ) => Account

    static accountKey: {
        decode: (
            rlpEncodedKey: string
        ) => AccountKeyLegacy | AccountKeyPublic | AccountKeyFail | AccountKeyWeightedMultiSig | AccountKeyRoleBased
        accountKeyLegacy: IAccountKeyLegacy
        accountKeyPublic: IAccountKeyPublic
        accountKeyFail: IAccountKeyFail
        accountKeyWeightedMultiSig: IAccountKeyWeightedMultiSig
        accountKeyRoleBased: IAccountKeyRoleBased
        weightedPublicKey: IWeightedPublicKey
    }

    static weightedMultiSigOptions: IWeightedMultiSigOptions

    /**
     * Create an account.
     * @param {string} address - The address of account.
     * @param {AccountKeyLegacy|AccountKeyPublic|AccountKeyFail|AccountKeyWeightedMultiSig|AccountKeyRoleBased} accountKey - The accountKey of account.
     */
    constructor(
        address: string,
        accountKey: AccountKeyLegacy | AccountKeyPublic | AccountKeyFail | AccountKeyWeightedMultiSig | AccountKeyRoleBased
    )

    /**
     * @type {string}
     */
    get address(): string

    set address(addressInput: string)

    /**
     * @type {AccountKeyLegacy|AccountKeyPublic|AccountKeyFail|AccountKeyWeightedMultiSig|AccountKeyRoleBased}
     */
    get accountKey(): AccountKeyLegacy | AccountKeyPublic | AccountKeyFail | AccountKeyWeightedMultiSig | AccountKeyRoleBased

    set accountKey(accountKey: AccountKeyLegacy | AccountKeyPublic | AccountKeyFail | AccountKeyWeightedMultiSig | AccountKeyRoleBased)

    /**
     * returns RLP-encoded account key string.
     *
     * @return {string}
     */
    getRLPEncodingAccountKey: () => string
}
