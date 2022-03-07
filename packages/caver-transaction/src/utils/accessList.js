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

const AccessTuple = require('./accessTuple')

/**
 * Represents an access list.
 * AccessList is an EIP-2930 access list.
 * @class
 */
class AccessList extends Array {
    /**
     * Creates an access list.
     *
     * @example
     * const items = [
     *      caver.transaction.utils.accessTuple.create('0x{address in hex}', [ '0x{storage key}' ]),
     *      caver.transaction.utils.accessTuple.create('0x{address in hex}', [ '0x{storage key}' ]),
     * ]
     * const result = caver.transaction.utils.accessList.create(items)
     *
     *
     * const items = [
     *      { address: '0x{address in hex}', storageKeys: [ '0x{storage key}' ] },
     *      { address: '0x{address in hex}', storageKeys: [ '0x{storage key}' ] },
     * ]
     * const result = caver.transaction.utils.accessList.create(items)
     *
     * @param {Array.<AccessTuple> | Array.<module:Transaction.AccessTupleObject>} items - An array of the access list items.
     * @return {AccessList} An access list.
     */
    static create(items) {
        const accessList = new AccessList()
        for (const item of items) {
            accessList.push(AccessTuple.create(item.address, item.storageKeys))
        }
        return accessList
    }

    /**
     * Returns a decoded access list.
     *
     * @example
     * const encoded = [
     *      [
     *          '0xac60c5e6d2a8f3fe856ad0a39522098e03065893',
     *          [
     *              '0x0000000000000000000000000000000000000000000000000000000000000000'
     *          ]
     *      ]
     * ]
     * const result = caver.transaction.utils.accessList.decode(encoded)
     *
     * @param {Array.<Array.<string|Array.<string>>> items - An encoded access list.
     * @return {AccessList} An access list.
     */
    static decode(encoded) {
        const accessList = new AccessList()
        for (const item of encoded) {
            accessList.push(AccessTuple.create(item[0], item[1]))
        }
        return accessList
    }

    /**
     * Added access tuple in access list.
     *
     * @example
     * accessList.push(caver.transaction.utils.accessTuple.create('0x{address in hex}', [ '0x{storage key}' ]))
     * accessList.push({ address: '0x{address in hex}', storageKeys: [ '0x{storage key}' ] })
     *
     * @param {AccessTuple | module:Transaction.AccessTupleObject} item - An object of the access list item.
     * @return {number}
     */
    push(item) {
        if (!(item instanceof AccessTuple)) item = AccessTuple.create(item)
        return super.push(item)
    }

    /**
     * Returns an encoded access list.
     *
     * @example
     * const result = accessList.encodeToBytes()
     *
     * @return {Array.<Array.<string|Array.<string>>>} An encoded access list.
     */
    encodeToBytes() {
        const bufferAccessList = []
        for (let i = 0; i < this.length; i++) {
            const item = this[i]
            bufferAccessList.push(item.encodeToBytes())
        }
        return bufferAccessList
    }

    /**
     * Returns whether the AccessList object is the same as the accessList passed as a parameter.
     *
     * @example
     * const result = accessList.isEqual(acl)
     *
     * @return {boolean} Returns `true` is accessList has value with a param.
     */
    isEqual(acl) {
        if (this.length !== acl.length) return false

        for (let i = 0; i < this.length; i++) {
            const item = this[i]
            const target = acl[i]
            if (!item.isEqual(target)) return false
        }
        return true
    }

    /**
     * Returns a JSON object without _ prefix variable name.
     *
     * @example
     * const result = accessList.toObject()
     *
     * @return {Array.<module:Transaction.AccessTupleObject>} An access list object.
     */
    toObject() {
        const accessListObject = []
        for (let i = 0; i < this.length; i++) {
            accessListObject.push(this[i].toObject())
        }
        return accessListObject
    }
}

module.exports = AccessList
