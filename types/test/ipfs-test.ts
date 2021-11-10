/*
    Copyright 2021 The caver-js Authors
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

import Caver, { IPFS } from 'caver-js'

const caver = new Caver()

// $ExpectType IPFS
caver.ipfs

// $ExpectType typeof IPFS
IPFS

// $ExpectType IPFS
let ipfs = new IPFS()
// $ExpectType IPFS
ipfs = new IPFS('ipfs.infura.io', 5001, true)

// $ExpectType void
ipfs.setIPFSNode('ipfs.infura.io', 5001, true)

const testFileName = './ipfsTestFile.txt'

// $ExpectType Promise<string>
ipfs.add(testFileName)
// $ExpectType Promise<string>
ipfs.add(Buffer.from([]))
// $ExpectType Promise<string>
ipfs.add(new ArrayBuffer(1))

// $ExpectType Promise<Buffer>
ipfs.get('hash')

// $ExpectType string
ipfs.toHex('hash')

// $ExpectType string
ipfs.fromHex('hash')
