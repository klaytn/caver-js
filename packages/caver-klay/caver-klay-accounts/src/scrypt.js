/*
    Modifications copyright 2019 The caver-js Authors
    This file is part of web3.js.

    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.

    This file is derived from web3.js/packages/web3-eth-accounts/src/scrpyt.js (2019/09/03).
    Modified and improved for the caver-js development.
*/

const scryptsy = require('scryptsy')

let scrypt

const isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]'
if (isNode) {
    const NODE_MIN_VER_WITH_BUILTIN_SCRYPT = '10.5.0'
    const NODE_MIN_VER_INCOMPAT_SCRYPT_PKG = '12.0.0'
    const semver = require('semver')
    const useNodeBuiltin = isNode && semver.Range(`>=${NODE_MIN_VER_WITH_BUILTIN_SCRYPT}`).test(process.version)

    const tryScryptPkg = (function() {
        let scryptPkg
        return function() {
            if (scryptPkg !== undefined) {
                return scryptPkg
            }
            try {
                scryptPkg = (function(m) {
                    return require(m)
                })('scrypt')
            } catch (e) {
                if (/was compiled against a different/.test(e.message)) {
                    throw e
                }
                scryptPkg = null
            }
            return scryptPkg
        }
    })()

    const canImprove = function(nodeVer) {
        return `can improve web3's peformance when running Node.js versions older than ${nodeVer} by installing the (deprecated) scrypt package in your project`
    }

    if (useNodeBuiltin) {
        const crypto = require('crypto')
        let fallbackCount = 0
        scrypt = function(key, salt, N, r, p, dkLen) {
            try {
                return crypto.scryptSync(key, salt, dkLen, { N: N, r: r, p: p })
            } catch (e) {
                if (/scrypt:memory limit exceeded/.test(e.message)) {
                    const scryptPkg = tryScryptPkg()
                    if (scryptPkg) {
                        return scryptPkg.hashSync(key, { N: N, r: r, p: p }, dkLen, salt)
                    }
                    fallbackCount += 1
                    console.warn(
                        '\x1b[33m%s\x1b[0m',
                        `Memory limit exceeded for Node's built-in crypto.scrypt, falling back to scryptsy (times: ${fallbackCount}), if this happens frequently you ${canImprove(
                            NODE_MIN_VER_INCOMPAT_SCRYPT_PKG
                        )}`
                    )
                    return scryptsy(key, salt, N, r, p, dkLen)
                }
                throw e
            }
        }
    } else {
        const scryptPkg = tryScryptPkg()
        if (scryptPkg) {
            scrypt = function(key, salt, N, r, p, dkLen) {
                return scryptPkg.hashSync(key, { N: N, r: r, p: p }, dkLen, salt)
            }
        } else {
            console.warn('\x1b[33m%s\x1b[0m', `You ${canImprove(NODE_MIN_VER_WITH_BUILTIN_SCRYPT)}`)
        }
    }
}

scrypt = scrypt || scryptsy

module.exports = scrypt
