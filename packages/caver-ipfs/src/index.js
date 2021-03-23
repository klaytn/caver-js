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

const lodash = require('lodash')
const fs = require('fs')
const IPFSAPI = require('ipfs-http-client-lite')
const multihash = require('multihashes')

/**
 * Representing a class for uploading and loading files to IPFS.
 * @class
 */
class IPFS {
    /**
     * Create an IPFS.
     * @param {string} host The host url.
     * @param {number} port The port number to use.
     * @param {boolean} ssl With or without SSL.
     */
    constructor(host, port, ssl) {
        if (host !== undefined && port !== undefined && ssl !== undefined) {
            this.setIPFSNode(host, port, ssl)
        }
    }

    /**
     * sets a IPFS Node
     *
     * @param {string} host The host url.
     * @param {number} port The port number to use.
     * @param {boolean} ssl With or without SSL.
     * @return {void}
     */
    setIPFSNode(host, port, ssl) {
        const protocol = ssl ? 'https' : 'http'
        this.ipfs = IPFSAPI({ apiUrl: `${protocol}://${host}:${port}` })
    }

    /**
     * adds a file to IPFS.
     * If the `data` parameter is a `Buffer` or `ArrayBuffer`, upload to IPFS directly without using `fs`.
     * If the `data` parameter is a string, use `fs` to read the file.
     * Since `fs` is a module that can only be used on the server side, if it is client-side code,
     * it must read the file in advance and pass the file contents in the format of `ArrayBuffer`.
     *
     * If you get a "Error: Can't resolve 'fs'" error when building your client code, add the following to your "webpack.config.json" file.
     * @example
     * module.exports = {
     *     ...
     *     node: {
     *         fs: 'empty',
     *     },
     *     ...
     * }
     * @returns {null}
     *
     * If you use Next.js web framework(https://nextjs.org/), add the following to your "next.config.json" file.
     * @example
     * module.exports = {
     *     ...
     *     webpack: (config, { isServer }) => {
     *         // Fixes npm packages that depend on `fs` module
     *         if (!isServer) {
     *             config.node = {
     *                 fs: 'empty'
     *             }
     *         }
     *         return config
     *     },
     *     ...
     * }
     * @returns {null}
     *
     * @param {string|Buffer|ArrayBuffer} data The file path string or file contents.
     * @return {string}
     */
    async add(data) {
        if (!this.ipfs) throw new Error(`Please set IPFS Node through 'caver.ipfs.setIPFSNode'.`)

        // Read file
        if (lodash.isString(data)) {
            if (typeof window !== 'undefined')
                throw new Error(`Cannot use fs module: Please pass the file contents as a parameter of type Buffer or ArrayBuffer.`)
            data = fs.readFileSync(data)
        }
        if (!lodash.isBuffer(data) && !lodash.isArrayBuffer(data)) throw new Error(`Invalid data: ${data}`)

        const ret = await this.ipfs.add(Buffer.from(data))
        return ret[0].hash
    }

    /**
     * gets a file from IPFS
     *
     * @param {string} hash The file hash string.
     * @return {Buffer}
     */
    async get(hash) {
        if (!this.ipfs) throw new Error(`Please set IPFS Node through 'caver.ipfs.setIPFSNode'.`)
        const ret = await this.ipfs.cat(hash)
        return ret
    }

    /**
     * converts a hash to hex format.
     *
     * @param {string} hash The file hash string.
     * @return {string}
     */
    toHex(hash) {
        const buf = multihash.fromB58String(hash)
        return `0x${multihash.toHexString(buf)}`
    }

    /**
     * converts from a hex format.
     *
     * @param {string} hash The file hash string in hex format.
     * @return {string}
     */
    fromHex(contentHash) {
        const hex = contentHash.substring(2)
        const buf = multihash.fromHexString(hex)
        return multihash.toB58String(buf)
    }
}

module.exports = IPFS
