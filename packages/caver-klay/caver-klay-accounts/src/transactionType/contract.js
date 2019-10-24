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
    SMART_CONTRACT_DEPLOY_TYPE_TAG,
    SMART_CONTRACT_EXECUTION_TYPE_TAG,
    FEE_DELEGATED_SMART_CONTRACT_EXECUTION_TYPE_TAG,
    FEE_DELEGATED_SMART_CONTRACT_DEPLOY_TYPE_TAG,
    FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO_TYPE_TAG,
    FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO_TYPE_TAG,
    CODE_FORMAT_EVM_TAG,
} = helpers.constants

function getCodeFormatTag(codeFormat) {
    switch (codeFormat) {
        case 0:
        case 'EVM':
            return CODE_FORMAT_EVM_TAG
    }
    return CODE_FORMAT_EVM_TAG
}

function rlpEncodeForContractDeploy(transaction) {
    return RLP.encode([
        RLP.encode([
            SMART_CONTRACT_DEPLOY_TYPE_TAG,
            Bytes.fromNat(transaction.nonce),
            Bytes.fromNat(transaction.gasPrice),
            Bytes.fromNat(transaction.gas),
            transaction.to.toLowerCase(),
            Bytes.fromNat(transaction.value),
            transaction.from.toLowerCase(),
            transaction.data,
            Bytes.fromNat(transaction.humanReadable === true ? '0x1' : '0x0'),
            Bytes.fromNat(getCodeFormatTag(transaction.codeFormat)),
        ]),
        Bytes.fromNat(transaction.chainId || '0x1'),
        '0x',
        '0x',
    ])
}

function rlpEncodeForContractExecution(transaction) {
    return RLP.encode([
        RLP.encode([
            SMART_CONTRACT_EXECUTION_TYPE_TAG,
            Bytes.fromNat(transaction.nonce),
            Bytes.fromNat(transaction.gasPrice),
            Bytes.fromNat(transaction.gas),
            transaction.to.toLowerCase(),
            Bytes.fromNat(transaction.value || '0x0'),
            transaction.from.toLowerCase(),
            transaction.data,
        ]),
        Bytes.fromNat(transaction.chainId || '0x1'),
        '0x',
        '0x',
    ])
}

function rlpEncodeForFeeDelegatedSmartContractDeploy(transaction) {
    if (transaction.senderRawTransaction) {
        const typeDetacehdRawTransaction = `0x${transaction.senderRawTransaction.slice(4)}`

        const [nonce, gasPrice, gas, to, value, from, data, humanReadable, codeFormat, [[v, r, s]]] = utils.rlpDecode(
            typeDetacehdRawTransaction
        )

        return RLP.encode([
            RLP.encode([
                FEE_DELEGATED_SMART_CONTRACT_DEPLOY_TYPE_TAG,
                Bytes.fromNat(nonce),
                Bytes.fromNat(gasPrice),
                Bytes.fromNat(gas),
                to.toLowerCase(),
                Bytes.fromNat(value),
                from.toLowerCase(),
                data,
                humanReadable,
                codeFormat,
            ]),
            transaction.feePayer.toLowerCase(),
            Bytes.fromNat(transaction.chainId || '0x1'),
            '0x',
            '0x',
        ])
    }
    return RLP.encode([
        RLP.encode([
            FEE_DELEGATED_SMART_CONTRACT_DEPLOY_TYPE_TAG,
            Bytes.fromNat(transaction.nonce),
            Bytes.fromNat(transaction.gasPrice),
            Bytes.fromNat(transaction.gas),
            transaction.to.toLowerCase(),
            Bytes.fromNat(transaction.value),
            transaction.from.toLowerCase(),
            transaction.data,
            Bytes.fromNat(transaction.humanReadable === true ? '0x1' : '0x0'),
            Bytes.fromNat(getCodeFormatTag(transaction.codeFormat)),
        ]),
        Bytes.fromNat(transaction.chainId || '0x1'),
        '0x',
        '0x',
    ])
}

function rlpEncodeForFeeDelegatedSmartContractDeployWithRatio(transaction) {
    if (transaction.senderRawTransaction) {
        const typeDetacehdRawTransaction = `0x${transaction.senderRawTransaction.slice(4)}`

        const [nonce, gasPrice, gas, to, value, from, data, humanReadable, feeRatio, codeFormat, [[v, r, s]]] = utils.rlpDecode(
            typeDetacehdRawTransaction
        )

        return RLP.encode([
            RLP.encode([
                FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO_TYPE_TAG,
                Bytes.fromNat(nonce),
                Bytes.fromNat(gasPrice),
                Bytes.fromNat(gas),
                to.toLowerCase(),
                Bytes.fromNat(value),
                from.toLowerCase(),
                data,
                humanReadable,
                feeRatio,
                codeFormat,
            ]),
            transaction.feePayer.toLowerCase(),
            Bytes.fromNat(transaction.chainId || '0x1'),
            '0x',
            '0x',
        ])
    }
    return RLP.encode([
        RLP.encode([
            FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO_TYPE_TAG,
            Bytes.fromNat(transaction.nonce),
            Bytes.fromNat(transaction.gasPrice),
            Bytes.fromNat(transaction.gas),
            transaction.to.toLowerCase(),
            Bytes.fromNat(transaction.value),
            transaction.from.toLowerCase(),
            transaction.data,
            Bytes.fromNat(transaction.humanReadable === true ? '0x1' : '0x0'),
            Bytes.fromNat(transaction.feeRatio),
            Bytes.fromNat(getCodeFormatTag(transaction.codeFormat)),
        ]),
        Bytes.fromNat(transaction.chainId || '0x1'),
        '0x',
        '0x',
    ])
}

function rlpEncodeForFeeDelegatedSmartContractExecution(transaction) {
    if (transaction.senderRawTransaction) {
        const typeDetacehdRawTransaction = `0x${transaction.senderRawTransaction.slice(4)}`

        const [nonce, gasPrice, gas, to, value, from, data, [[v, r, s]]] = utils.rlpDecode(typeDetacehdRawTransaction)

        return RLP.encode([
            RLP.encode([
                FEE_DELEGATED_SMART_CONTRACT_EXECUTION_TYPE_TAG,
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
            FEE_DELEGATED_SMART_CONTRACT_EXECUTION_TYPE_TAG,
            Bytes.fromNat(transaction.nonce),
            Bytes.fromNat(transaction.gasPrice),
            Bytes.fromNat(transaction.gas),
            transaction.to.toLowerCase(),
            Bytes.fromNat(transaction.value || '0x0'),
            transaction.from.toLowerCase(),
            transaction.data,
        ]),
        Bytes.fromNat(transaction.chainId || '0x1'),
        '0x',
        '0x',
    ])
}

function rlpEncodeForFeeDelegatedSmartContractExecutionWithRatio(transaction) {
    if (transaction.senderRawTransaction) {
        const typeDetacehdRawTransaction = `0x${transaction.senderRawTransaction.slice(4)}`

        const [nonce, gasPrice, gas, to, value, from, data, feeRatio, [[v, r, s]]] = utils.rlpDecode(typeDetacehdRawTransaction)

        return RLP.encode([
            RLP.encode([
                FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO_TYPE_TAG,
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
            FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO_TYPE_TAG,
            Bytes.fromNat(transaction.nonce),
            Bytes.fromNat(transaction.gasPrice),
            Bytes.fromNat(transaction.gas),
            transaction.to.toLowerCase(),
            Bytes.fromNat(transaction.value || '0x0'),
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
    rlpEncodeForContractDeploy,
    rlpEncodeForFeeDelegatedSmartContractDeploy,
    rlpEncodeForFeeDelegatedSmartContractDeployWithRatio,

    rlpEncodeForContractExecution,
    rlpEncodeForFeeDelegatedSmartContractExecution,
    rlpEncodeForFeeDelegatedSmartContractExecutionWithRatio,
}
