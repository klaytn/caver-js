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
const utils = require('../../../../caver-utils')
const helpers = require('../../../../caver-core-helpers')

const {
    VALUE_TRANFSER_TYPE_TAG,
    VALUE_TRANSFER_MEMO_TYPE_TAG,
    FEE_DELEGATED_VALUE_TRANSFER_TYPE_TAG,
    FEE_DELEGATED_VALUE_TRANSFER_MEMO_TYPE_TAG,
    FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO_TYPE_TAG,
    FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO_TYPE_TAG,
} = helpers.constants

function rlpEncodeForValueTransfer(transaction) {
    return RLP.encode([
        RLP.encode([
            VALUE_TRANFSER_TYPE_TAG,
            Bytes.fromNat(transaction.nonce),
            Bytes.fromNat(transaction.gasPrice),
            Bytes.fromNat(transaction.gas),
            transaction.to.toLowerCase(),
            Bytes.fromNat(transaction.value),
            transaction.from.toLowerCase(),
        ]),
        Bytes.fromNat(transaction.chainId || '0x1'),
        '0x',
        '0x',
    ])
}

// TODO:
function rlpEncodeForValueTransferMemo(transaction) {
    return RLP.encode([
        RLP.encode([
            VALUE_TRANSFER_MEMO_TYPE_TAG,
            Bytes.fromNat(transaction.nonce),
            Bytes.fromNat(transaction.gasPrice),
            Bytes.fromNat(transaction.gas),
            transaction.to.toLowerCase(),
            Bytes.fromNat(transaction.value),
            transaction.from.toLowerCase(),
            transaction.data,
        ]),
        Bytes.fromNat(transaction.chainId || '0x1'),
        '0x',
        '0x',
    ])
}

function rlpEncodeForFeeDelegatedValueTransfer(transaction) {
    if (transaction.senderRawTransaction) {
        // fee payer rlp encoding.
        const typeDetacehdRawTransaction = `0x${transaction.senderRawTransaction.slice(4)}`

        const [nonce, gasPrice, gas, to, value, from, [[v, r, s]]] = utils.rlpDecode(typeDetacehdRawTransaction)

        return RLP.encode([
            RLP.encode([
                FEE_DELEGATED_VALUE_TRANSFER_TYPE_TAG,
                Bytes.fromNat(nonce),
                Bytes.fromNat(gasPrice),
                Bytes.fromNat(gas),
                to.toLowerCase(),
                Bytes.fromNat(value),
                from.toLowerCase(),
            ]),
            transaction.feePayer.toLowerCase(),
            Bytes.fromNat(transaction.chainId || '0x1'),
            '0x',
            '0x',
        ])
    }
    return RLP.encode([
        RLP.encode([
            FEE_DELEGATED_VALUE_TRANSFER_TYPE_TAG,
            Bytes.fromNat(transaction.nonce),
            Bytes.fromNat(transaction.gasPrice),
            Bytes.fromNat(transaction.gas),
            transaction.to.toLowerCase(),
            Bytes.fromNat(transaction.value),
            transaction.from.toLowerCase(),
        ]),
        Bytes.fromNat(transaction.chainId || '0x1'),
        '0x',
        '0x',
    ])
}

function rlpEncodeForFeeDelegatedValueTransferWithRatio(transaction) {
    if (transaction.senderRawTransaction) {
        // fee payer rlp encoding.
        const typeDetacehdRawTransaction = `0x${transaction.senderRawTransaction.slice(4)}`

        const [nonce, gasPrice, gas, to, value, from, feeRatio, [[v, r, s]]] = utils.rlpDecode(typeDetacehdRawTransaction)

        return RLP.encode([
            RLP.encode([
                FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO_TYPE_TAG,
                Bytes.fromNat(nonce),
                Bytes.fromNat(gasPrice),
                Bytes.fromNat(gas),
                to.toLowerCase(),
                Bytes.fromNat(value),
                from.toLowerCase(),
                feeRatio,
            ]),
            transaction.feePayer.toLowerCase(),
            Bytes.fromNat(transaction.chainId || '0x1'),
            '0x',
            '0x',
        ])
    }
    return RLP.encode([
        RLP.encode([
            FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO_TYPE_TAG,
            Bytes.fromNat(transaction.nonce),
            Bytes.fromNat(transaction.gasPrice),
            Bytes.fromNat(transaction.gas),
            transaction.to.toLowerCase(),
            Bytes.fromNat(transaction.value),
            transaction.from.toLowerCase(),
            Bytes.fromNat(transaction.feeRatio),
        ]),
        Bytes.fromNat(transaction.chainId || '0x1'),
        '0x',
        '0x',
    ])
}

function rlpEncodeForFeeDelegatedValueTransferMemo(transaction) {
    if (transaction.senderRawTransaction) {
        // fee payer rlp encoding.
        const typeDetacehdRawTransaction = `0x${transaction.senderRawTransaction.slice(4)}`

        const [nonce, gasPrice, gas, to, value, from, data, [[v, r, s]]] = utils.rlpDecode(typeDetacehdRawTransaction)

        return RLP.encode([
            RLP.encode([
                FEE_DELEGATED_VALUE_TRANSFER_MEMO_TYPE_TAG,
                Bytes.fromNat(nonce),
                Bytes.fromNat(gasPrice),
                Bytes.fromNat(gas),
                to.toLowerCase(),
                Bytes.fromNat(value),
                from.toLowerCase(),
                data,
            ]),
            transaction.feePayer.toLowerCase(),
            Bytes.fromNat(transaction.chainId || '0x1'),
            '0x',
            '0x',
        ])
    }
    return RLP.encode([
        RLP.encode([
            FEE_DELEGATED_VALUE_TRANSFER_MEMO_TYPE_TAG,
            Bytes.fromNat(transaction.nonce),
            Bytes.fromNat(transaction.gasPrice),
            Bytes.fromNat(transaction.gas),
            transaction.to.toLowerCase(),
            Bytes.fromNat(transaction.value),
            transaction.from.toLowerCase(),
            transaction.data,
        ]),
        Bytes.fromNat(transaction.chainId || '0x1'),
        '0x',
        '0x',
    ])
}

function rlpEncodeForFeeDelegatedValueTransferMemoWithRatio(transaction) {
    if (transaction.senderRawTransaction) {
        // fee payer rlp encoding.
        const typeDetacehdRawTransaction = `0x${transaction.senderRawTransaction.slice(4)}`

        const [nonce, gasPrice, gas, to, value, from, data, feeRatio, [[v, r, s]]] = utils.rlpDecode(typeDetacehdRawTransaction)

        return RLP.encode([
            RLP.encode([
                FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO_TYPE_TAG,
                Bytes.fromNat(nonce),
                Bytes.fromNat(gasPrice),
                Bytes.fromNat(gas),
                to.toLowerCase(),
                Bytes.fromNat(value),
                from.toLowerCase(),
                data,
                Bytes.fromNat(feeRatio),
            ]),
            transaction.feePayer.toLowerCase(),
            Bytes.fromNat(transaction.chainId || '0x1'),
            '0x',
            '0x',
        ])
    }
    return RLP.encode([
        RLP.encode([
            FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO_TYPE_TAG,
            Bytes.fromNat(transaction.nonce),
            Bytes.fromNat(transaction.gasPrice),
            Bytes.fromNat(transaction.gas),
            transaction.to.toLowerCase(),
            Bytes.fromNat(transaction.value),
            transaction.from.toLowerCase(),
            transaction.data,
            Bytes.fromNat(transaction.feeRatio),
        ]),
        Bytes.fromNat(transaction.chainId || '0x1'),
        '0x',
        '0x',
    ])
}

module.exports = {
    rlpEncodeForValueTransfer,
    rlpEncodeForValueTransferMemo,
    rlpEncodeForFeeDelegatedValueTransfer,
    rlpEncodeForFeeDelegatedValueTransferWithRatio,
    rlpEncodeForFeeDelegatedValueTransferMemo,
    rlpEncodeForFeeDelegatedValueTransferMemoWithRatio,
}
