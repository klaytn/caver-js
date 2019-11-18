/*
    Copyright 2018 The caver-js Authors
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

function randomHex(size, callback) {
    const crypto = require('./crypto.js')
    const isCallback = typeof callback === 'function'

    if (size < 0 || size > 65536) {
        if (isCallback) {
            callback(new Error('Invalid size: It must be >=0 && <= 65536'))
        } else {
            throw new Error('Invalid size: It must be >=0 && <= 65536')
        }
    }

    // If environment is in node
    if (typeof crypto !== 'undefined' && crypto.randomBytes) {
        if (isCallback) {
            crypto.randomBytes(size, (err, result) => {
                if (!err) {
                    callback(null, `0x${result.toString('hex')}`)
                } else {
                    callback(err)
                }
            })
        } else {
            return `0x${crypto.randomBytes(size).toString('hex')}`
        }

        // If environment is in browser
    } else {
        let cryptoLib
        if (typeof crypto !== 'undefined') {
            cryptoLib = crypto
        } else if (typeof msCrypto !== 'undefined') {
            /* eslint-disable no-undef */
            cryptoLib = msCrypto
        }

        if (cryptoLib && cryptoLib.getRandomValues) {
            const randomBytes = cryptoLib.getRandomValues(new Uint8Array(size))
            const returnValue = `0x${Array.from(randomBytes)
                .map(arr => arr.toString(16))
                .join('')}`

            if (isCallback) {
                callback(null, returnValue)
            } else {
                return returnValue
            }

            // crypto object is missing in browser.
        } else {
            const error = new Error('"crypto" object does not exist. This Browser does not support generating secure random bytes.')

            if (isCallback) {
                callback(error)
            } else {
                throw error
            }
        }
    }
}

module.exports = randomHex
