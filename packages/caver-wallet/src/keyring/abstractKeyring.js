/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/*
    Copyright 2020 The caver-js Authors
    This file is part of the caver-js library.

    The caver-js library is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    The caver-js library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with the caver-js. If not, see <http://www.gnu.org/licenses/>.
*/

const utils = require('../../../caver-utils/src')

/**
 * representing a Keyring which includes `address` and `private keys` by roles.
 * @class
 */
class AbstractKeyring {
    /**
     * creates a keyring.
     * @param {string} address - The address of keyring.
     */
    constructor(address) {
        this.address = address
    }

    /**
     * @type {string}
     */
    get address() {
        return this._address
    }

    set address(addressInput) {
        if (!utils.isAddress(addressInput)) throw new Error(`Invalid address : ${addressInput}`)

        this._address = utils.addHexPrefix(addressInput).toLowerCase()
    }

    /**
     * signs with transactionHash with a key and returns signature(s).
     * This method has to be overrided in classes which extends AbstractKeyring.
     *
     * @return {Array.<string>|Array.<Array.<string>>}
     */
    sign(transactionHash, chainId, role, index) {
        throw new Error(`Not implemented.`)
    }

    /**
     * signs with hashed message and returns result object that includes `signatures`, `message` and `messageHash`.
     * This method has to be overrided in classes which extends AbstractKeyring.
     *
     * @return {object}
     */
    signMessage(message, role, index) {
        throw new Error(`Not implemented.`)
    }

    /**
     * encrypts a keyring and returns a keystore v4 object.
     * This method has to be overrided in classes which extends AbstractKeyring.
     *
     * @return {object}
     */
    encrypt(password, options = {}) {
        throw new Error(`Not implemented.`)
    }

    /**
     * returns a copied singleKeyring instance.
     * This method has to be overrided in classes which extends AbstractKeyring.
     *
     * @return {AbstractKeyring}
     */
    copy() {
        throw new Error(`Not implemented.`)
    }

    /**
     * returns KlaytnWalletKey format. If keyring uses more than one private key, this function will throw error.
     *
     * @return {string}
     */
    getKlaytnWalletKey() {
        throw new Error(`Not supported for this class.`)
    }

    /**
     * encrypts a keyring and returns a keystore v3 object.
     *
     * @param {string} password The password to be used for keyring encryption. The encrypted key store can be decrypted with this password.
     * @param {object} options The options to use when encrypt a keyring. See `keyring.encrypt` for more detail about options.
     * @return {object}
     */
    encryptV3(password, options) {
        throw new Error(`Not supported for this class. Use 'keyring.encrypt(password)'.`)
    }

    /**
     * returns true if keyring has decoupled key.
     *
     * @return {boolean}
     */
    isDecoupled() {
        return true
    }
}

module.exports = AbstractKeyring
