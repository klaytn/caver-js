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

const RLP = require('eth-lib/lib/rlp')
const Bytes = require('eth-lib/lib/bytes')
const helpers = require('../../../../caver-core-helpers')

const { CHAIN_DATA_ANCHORING_TYPE_TAG } = helpers.constants

function rlpEncodeForChainDataAnchoring(transaction) {
    return RLP.encode([
        RLP.encode([
            CHAIN_DATA_ANCHORING_TYPE_TAG,
            Bytes.fromNat(transaction.nonce),
            Bytes.fromNat(transaction.gasPrice),
            Bytes.fromNat(transaction.gas),
            transaction.to.toLowerCase(),
            Bytes.fromNat(transaction.value),
            transaction.from.toLowerCase(),
            Bytes.fromNat(transaction.anchoredData),
        ]),
        Bytes.fromNat(transaction.chainId || '0x1'),
        '0x',
        '0x',
    ])
}

module.exports = {
    rlpEncodeForChainDataAnchoring,
}
