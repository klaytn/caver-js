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

const AccountLib = require('eth-lib/lib/account')
const KeyringContainer = require('./keyringContainer')
const Keyring = require('./keyring/keyring')
const utils = require('../../caver-utils/src')

/**
 * representing a Wallet class in caver-wallet package.
 * This Wallet class is a wrapper for KeyringContainer.
 * @class
 */
class Wallet {
    constructor(keyrings) {
        this.keyringContainer = new KeyringContainer(keyrings)
        this.keyring = Keyring

        // Bind methods of KeyringContainer to Wallet
        this.generate = this.keyringContainer.generate.bind(this.keyringContainer)
        this.newKeyring = this.keyringContainer.newKeyring.bind(this.keyringContainer)
        this.updateKeyring = this.keyringContainer.updateKeyring.bind(this.keyringContainer)
        this.getKeyring = this.keyringContainer.getKeyring.bind(this.keyringContainer)

        this.add = this.keyringContainer.add.bind(this.keyringContainer)
        this.remove = this.keyringContainer.remove.bind(this.keyringContainer)

        this.signMessage = this.keyringContainer.signMessage.bind(this.keyringContainer)
        this.signWithKey = this.keyringContainer.signWithKey.bind(this.keyringContainer)
        this.signWithKeys = this.keyringContainer.signWithKeys.bind(this.keyringContainer)
        this.signFeePayerWithKey = this.keyringContainer.signFeePayerWithKey.bind(this.keyringContainer)
        this.signFeePayerWithKeys = this.keyringContainer.signFeePayerWithKeys.bind(this.keyringContainer)
    }

    /**
     * @type {number}
     */
    get length() {
        return this.keyringContainer.length
    }

    /**
     * generates a private key string
     *
     * `caver.wallet.generatePrivateKey()`
     *
     * @param {string} entropy A random string to increase entropy.
     * @return {string}
     */
    // eslint-disable-next-line class-methods-use-this
    generatePrivateKey(entropy) {
        return AccountLib.create(entropy || utils.randomHex(32)).privateKey
    }
}

module.exports = Wallet
