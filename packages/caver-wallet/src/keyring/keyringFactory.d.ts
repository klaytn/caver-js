import { IPrivateKey } from './privateKey'
import { ISingleKeyring } from './singleKeyring'
import { IMultipleKeyring } from './multipleKeyring'
import { IRoleBasedKeyring } from './roleBasedKeyring'
import { ISignatureData } from './signatureData'
import { KEY_ROLE } from './keyringHelper'

export interface IKeyringFactory {
    /**
     * generates a keyring instance
     *
     * `caver.wallet.keyring.generate()`
     *
     * @param {string} [entropy] A random string to increase entropy.
     * @return {SingleKeyring}
     */
    generate: (entropy?: string) => SingleKeyring

    /**
     * generates a single private key string
     *
     * `caver.wallet.keyring.generateSingleKey()`
     *
     * @param {string} [entropy] A random string to increase entropy.
     * @return {String}
     */
    generateSingleKey: (entropy?: string) => string
    /**
     * generates an array of private key strings
     *
     * `caver.wallet.keyring.generateMultipleKeys()`
     *
     * @param {number} num A length of keys.
     * @param {string} [entropy] A random string to increase entropy.
     * @return {Array.<String>}
     */
    generateMultipleKeys: (num: number, entropy?: string) => Array<string>

    /**
     * generates an array in which keys to be used for each role are defined as an array.
     *
     * `caver.wallet.keyring.generateRoleBasedKeys()`
     *
     * @param {Array.<number>} numArr An array containing the number of keys for each role.
     * @param {string} [entropy] A random string to increase entropy.
     * @return {Array.<Array.<String>>}
     */
    generateRoleBasedKeys: (numArr: Array<number>, entropy?: string) => Array<Array<string>>

    /**
     * creates a keyring instance with parameters
     *
     * `caver.wallet.keyring.create('0x${address in hex}', '0x{private key}')`
     * `caver.wallet.keyring.create('0x${address in hex}', ['0x{private key}', '0x{private key}'])`
     * `caver.wallet.keyring.create('0x${address in hex}', [['0x{private key}', '0x{private key}'], ['0x{private key}'], ['0x{private key}', '0x{private key}']])`
     *
     * @param {string} address An address of keyring.
     * @param {string|Array.<string>|Array.<Array.<string>>} key Private key(s) to use in keyring.
     * @return {AbstractKeyring}
     */
    create: (address: string, key: string | Array<string> | Array<Array<string>>) => AbstractKeyring

    /**
     * creates a keyring instance from a private key string. KlaytnWalletKey format also can be handled.
     *
     * @param {string} privateKey The key parameter can be either normal private key or KlaytnWalletKey format.
     * @return {SingleKeyring}
     */
    createFromPrivateKey: (privateKey: string) => SingleKeyring

    /**
     * creates a keyring instance from a KlaytnWalletKey string.
     *
     * @param {string} klaytnWalletKey A key string in KlaytnWalletKey format.
     * @return {SingleKeyring}
     */
    createFromKlaytnWalletKey: (klaytnWalletKey: string) => SingleKeyring

    /**
     * creates a keyring instance from an address and a private key string.
     *
     * @param {string} address An address of keyring.
     * @param {string} key A private key string.
     * @return {SingleKeyring}
     */
    createWithSingleKey: (address: string, key: string) => SingleKeyring

    /**
     * creates a keyring instance from an address and multiple private key strings.
     *
     * @param {string} address An address of keyring.
     * @param {Array.<string>} keyArray An array of private key strings.
     * @return {MultipleKeyring}
     */
    createWithMultipleKey: (address: string, keyArray: Array<string>) => MultipleKeyring

    /**
     * creates a keyring instance from an address and an array in which keys to be used for each role are defined as an array.
     *
     * @param {string} address An address of keyring.
     * @param {Array.<Array.<string>>} roledBasedKeyArray A two-dimensional array containing arrays of private key strings for each role.
     * @return {RoleBasedKeyring}
     */
    createWithRoleBasedKey: (address: string, roledBasedKeyArray: Array<Array<string>>) => RoleBasedKeyring

    /**
     * decrypts a keystore v3 or v4 JSON and returns keyring instance.
     *
     * @param {object} keystore The encrypted keystore to decrypt.
     * @param {string} password The password to use for decryption.
     * @return {AbstractKeyring}
     */
    decrypt: (keystore: object, password: string) => AbstractKeyring

    privateKey: IPrivateKey
    singleKeyring: ISingleKeyring
    multipleKeyring: IMultipleKeyring
    roleBasedKeyring: IRoleBasedKeyring
    role: KEY_ROLE
    signatureData: ISignatureData
    new (): KeyringFactory
}

/**
 * representing a KeyringFactory which supports create functions for Keyring(SingleKeyring/MultipleKeyring/RoleBasedKeyring)
 * @class
 */
export default class KeyringFactory {
    /**
     * generates a keyring instance
     *
     * `caver.wallet.keyring.generate()`
     *
     * @param {string} [entropy] A random string to increase entropy.
     * @return {SingleKeyring}
     */
    static generate: (entropy?: string) => SingleKeyring

    /**
     * generates a single private key string
     *
     * `caver.wallet.keyring.generateSingleKey()`
     *
     * @param {string} [entropy] A random string to increase entropy.
     * @return {String}
     */
    static generateSingleKey: (entropy?: string) => string
    /**
     * generates an array of private key strings
     *
     * `caver.wallet.keyring.generateMultipleKeys()`
     *
     * @param {number} num A length of keys.
     * @param {string} [entropy] A random string to increase entropy.
     * @return {Array.<String>}
     */
    static generateMultipleKeys: (num: number, entropy?: string) => Array<string>

    /**
     * generates an array in which keys to be used for each role are defined as an array.
     *
     * `caver.wallet.keyring.generateRoleBasedKeys()`
     *
     * @param {Array.<number>} numArr An array containing the number of keys for each role.
     * @param {string} [entropy] A random string to increase entropy.
     * @return {Array.<Array.<String>>}
     */
    static generateRoleBasedKeys: (numArr: Array<number>, entropy?: string) => Array<Array<string>>

    /**
     * creates a keyring instance with parameters
     *
     * `caver.wallet.keyring.create('0x${address in hex}', '0x{private key}')`
     * `caver.wallet.keyring.create('0x${address in hex}', ['0x{private key}', '0x{private key}'])`
     * `caver.wallet.keyring.create('0x${address in hex}', [['0x{private key}', '0x{private key}'], ['0x{private key}'], ['0x{private key}', '0x{private key}']])`
     *
     * @param {string} address An address of keyring.
     * @param {string|Array.<string>|Array.<Array.<string>>} key Private key(s) to use in keyring.
     * @return {AbstractKeyring}
     */
    static create: (address: string, key: string | Array<string> | Array<Array<string>>) => AbstractKeyring

    /**
     * creates a keyring instance from a private key string. KlaytnWalletKey format also can be handled.
     *
     * @param {string} privateKey The key parameter can be either normal private key or KlaytnWalletKey format.
     * @return {SingleKeyring}
     */
    static createFromPrivateKey: (privateKey: string) => SingleKeyring

    /**
     * creates a keyring instance from a KlaytnWalletKey string.
     *
     * @param {string} klaytnWalletKey A key string in KlaytnWalletKey format.
     * @return {SingleKeyring}
     */
    static createFromKlaytnWalletKey: (klaytnWalletKey: string) => SingleKeyring

    /**
     * creates a keyring instance from an address and a private key string.
     *
     * @param {string} address An address of keyring.
     * @param {string} key A private key string.
     * @return {SingleKeyring}
     */
    static createWithSingleKey: (address: string, key: string) => SingleKeyring

    /**
     * creates a keyring instance from an address and multiple private key strings.
     *
     * @param {string} address An address of keyring.
     * @param {Array.<string>} keyArray An array of private key strings.
     * @return {MultipleKeyring}
     */
    static createWithMultipleKey: (address: string, keyArray: Array<string>) => MultipleKeyring

    /**
     * creates a keyring instance from an address and an array in which keys to be used for each role are defined as an array.
     *
     * @param {string} address An address of keyring.
     * @param {Array.<Array.<string>>} roledBasedKeyArray A two-dimensional array containing arrays of private key strings for each role.
     * @return {RoleBasedKeyring}
     */
    static createWithRoleBasedKey: (address: string, roledBasedKeyArray: Array<Array<string>>) => RoleBasedKeyring

    /**
     * decrypts a keystore v3 or v4 JSON and returns keyring instance.
     *
     * @param {object} keystore The encrypted keystore to decrypt.
     * @param {string} password The password to use for decryption.
     * @return {AbstractKeyring}
     */
    static decrypt: (keystore: object, password: string) => AbstractKeyring

    static privateKey: IPrivateKey
    static singleKeyring: ISingleKeyring
    static multipleKeyring: IMultipleKeyring
    static roleBasedKeyring: IRoleBasedKeyring
    static role: KEY_ROLE
    static signatureData: ISignatureData
}
