/*
    Copyright 2022 The caver-js Authors
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

const _ = require('lodash')
const utils = require('../../../caver-utils/src')

/**
 * An object defines the access tuple.
 *
 * @typedef {object} module:Transaction.AccessTupleObject
 * @property {string} address - The address string.
 * @property {Array.<string>} storageKeys - An array of the storage keys.
 */
/**
 * Represents an access tuple that has an address and storage keys.
 * AccessTuple is the element type of the access list.
 * @class
 */
class AccessTuple {
    /**
     * Creates an access tuple.
     *
     * @example
     * const result = caver.transaction.utils.accessTuple.create('0x{address in hex}', [ '0x{storage key}' ])
     *
     * @param {string} address - The address string.
     * @param {Array.<string>} storageKeys - An array of the storage keys.
     * @return {AccessTuple} An access tuple.
     */
    static create(address, storageKeys) {
        return new AccessTuple(address, storageKeys)
    }

    /**
     * Creates an access tuple.
     * @constructor
     * @param {string} address - The address string.
     * @param {Array.<string>} storageKeys - An array of the storage keys.
     */
    constructor(address, storageKeys) {
        this.address = address
        this.storageKeys = storageKeys
    }

    /**
     * @type {string}
     */
    get address() {
        return this._address
    }

    set address(addr) {
        if (!_.isString(addr)) throw new Error(`Invalid address type: Address should be string type ${typeof addr}`)
        if (!utils.isAddress(addr)) throw new Error(`Invalid address: ${addr}`)
        addr = utils.addHexPrefix(addr)
        this._address = addr
    }

    /**
     * @type {Array.<string>}
     */
    get storageKeys() {
        return this._storageKeys
    }

    set storageKeys(keys) {
        if (!_.isArray(keys)) keys = [keys]
        for (let k of keys) {
            if (!_.isString(k)) throw new Error(`Invalid storageKey type: Storage key should be string type ${typeof k}`)
            if (!utils.isHex(k)) throw new Error(`Invalid storageKey: The storage key must be a hexadecimal string ${k}`)
            k = utils.addHexPrefix(k)
            if (k.length !== 66) throw new Error(`Invalid storageKey length: The storage key must be a 32-byte`)
        }
        keys.sort()
        this._storageKeys = keys
    }

    /**
     * Returns an encoded access tuple.
     *
     * @example
     * const result = accessTuple.encodeToBytes()
     *
     * @return {Array.<string|Array.<string>>} An encoded access tuple.
     */
    encodeToBytes() {
        const storageItems = []
        for (const key of this.storageKeys) {
            storageItems.push(key.toLowerCase())
        }
        return [this.address.toLowerCase(), storageItems]
    }

    /**
     * Returns whether the AccessTuple object is the same as the accessTuple passed as a parameter.
     *
     * @example
     * const result = accessTuple.isEqual(at)
     *
     * @return {boolean} Returns `true` is accessTuple has value with a param.
     */
    isEqual(at) {
        if (this.storageKeys.length !== at.storageKeys.length) return false
        if (this.address.toLowerCase() !== at.address.toLowerCase()) return false

        for (let i = 0; i < this.storageKeys.length; i++) {
            if (this.storageKeys[i].toLowerCase() !== at.storageKeys[i].toLowerCase()) return false
        }
        return true
    }

    /**
     * Returns a JSON object without _ prefix variable name.
     *
     * @example
     * const result = accessTuple.toObject()
     *
     * @return {module:Transaction.AccessTupleObject} An access tuple object.
     */
    toObject() {
        const accessTupleObject = { address: this.address, storageKeys: [] }
        for (const sk of this.storageKeys) {
            accessTupleObject.storageKeys.push(sk)
        }
        return accessTupleObject
    }
}

module.exports = AccessTuple
