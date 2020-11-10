export interface IAbstractKeyring {
    /**
     * creates a keyring.
     * @param {string} address - The address of keyring.
     */
    new (address: string): AbstractKeyring
}

/**
 * representing a Keyring which includes `address` and `private keys` by roles.
 * @class
 */
export default class AbstractKeyring {
    /**
     * creates a keyring.
     * @param {string} address - The address of keyring.
     */
    constructor(address: string)

    /**
     * @type {string}
     */
    get address(): string

    set address(addressInput: string)

    /**
     * returns KlaytnWalletKey format. If keyring uses more than one private key, this function will throw error.
     *
     * @return {string}
     */
    getKlaytnWalletKey(): string

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
