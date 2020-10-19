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

const fs = require('fs')
const IPFSAPI = require('ipfs-api')
const multihash = require('multihashes')

class IPFS {
    constructor() {
        this.ipfs = new IPFSAPI({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
    }

    async add(path) {
        const data = fs.readFileSync(path)
        const ret = await this.ipfs.add(data)
        return ret[0]
    }

    async get(hash) {
        const ret = await this.ipfs.cat(hash)
        return ret.toString()
    }

    toHex(hash) {
        const buf = multihash.fromB58String(hash)
        return `0x${multihash.toHexString(buf)}`
    }

    fromHex(contentHash) {
        const hex = contentHash.substring(2)
        const buf = multihash.fromHexString(hex)
        return multihash.toB58String(buf)
    }
}

module.exports = IPFS
