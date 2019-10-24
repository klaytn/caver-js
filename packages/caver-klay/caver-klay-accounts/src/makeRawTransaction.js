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
const Hash = require('eth-lib/lib/hash')
const utils = require('../../../caver-utils')

const {
    rlpEncodeForLegacyTransaction,
    rlpEncodeForValueTransfer,
    rlpEncodeForValueTransferMemo,
    rlpEncodeForFeeDelegatedValueTransferMemoWithRatio,
    rlpEncodeForFeeDelegatedValueTransfer,
    rlpEncodeForFeeDelegatedValueTransferWithRatio,
    rlpEncodeForFeeDelegatedValueTransferMemo,
    rlpEncodeForAccountUpdate,
    rlpEncodeForContractDeploy,
    rlpEncodeForContractExecution,
    rlpEncodeForFeeDelegatedAccountUpdate,
    rlpEncodeForFeeDelegatedAccountUpdateWithRatio,
    rlpEncodeForFeeDelegatedSmartContractDeploy,
    rlpEncodeForFeeDelegatedSmartContractDeployWithRatio,
    rlpEncodeForFeeDelegatedSmartContractExecution,
    rlpEncodeForFeeDelegatedSmartContractExecutionWithRatio,

    rlpEncodeForCancel,
    rlpEncodeForFeeDelegatedCancel,
    rlpEncodeForFeeDelegatedCancelWithRatio,
    rlpEncodeForChainDataAnchoring,

    parseAccountKey,
} = require('./transactionType')

const creationNotSupportError = 'ACCOUNT_CREATION transaction type is not supported yet.'

function encodeRLPByTxType(transaction) {
    transaction.type = transaction.senderRawTransaction
        ? utils.getTxTypeStringFromRawTransaction(transaction.senderRawTransaction)
        : transaction.type

    switch (transaction.type) {
        case 'ACCOUNT_CREATION':
            throw new Error(creationNotSupportError)
        case 'ACCOUNT_UPDATE':
            return rlpEncodeForAccountUpdate(transaction)
        case 'FEE_DELEGATED_ACCOUNT_UPDATE':
            return rlpEncodeForFeeDelegatedAccountUpdate(transaction)
        case 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO':
            return rlpEncodeForFeeDelegatedAccountUpdateWithRatio(transaction)
        case 'VALUE_TRANSFER':
            return rlpEncodeForValueTransfer(transaction)
        case 'VALUE_TRANSFER_MEMO':
            return rlpEncodeForValueTransferMemo(transaction)
        case 'FEE_DELEGATED_VALUE_TRANSFER':
            return rlpEncodeForFeeDelegatedValueTransfer(transaction)
        case 'FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO':
            return rlpEncodeForFeeDelegatedValueTransferWithRatio(transaction)
        case 'FEE_DELEGATED_VALUE_TRANSFER_MEMO':
            return rlpEncodeForFeeDelegatedValueTransferMemo(transaction)
        case 'FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO':
            return rlpEncodeForFeeDelegatedValueTransferMemoWithRatio(transaction)
        case 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY':
            return rlpEncodeForFeeDelegatedSmartContractDeploy(transaction)
        case 'SMART_CONTRACT_DEPLOY':
            return rlpEncodeForContractDeploy(transaction)
        case 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO':
            return rlpEncodeForFeeDelegatedSmartContractDeployWithRatio(transaction)
        case 'SMART_CONTRACT_EXECUTION':
            return rlpEncodeForContractExecution(transaction)
        case 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION':
            return rlpEncodeForFeeDelegatedSmartContractExecution(transaction)
        case 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO':
            return rlpEncodeForFeeDelegatedSmartContractExecutionWithRatio(transaction)
        case 'CANCEL':
            return rlpEncodeForCancel(transaction)
        case 'FEE_DELEGATED_CANCEL':
            return rlpEncodeForFeeDelegatedCancel(transaction)
        case 'FEE_DELEGATED_CANCEL_WITH_RATIO':
            return rlpEncodeForFeeDelegatedCancelWithRatio(transaction)
        case 'CHAIN_DATA_ANCHORING':
            return rlpEncodeForChainDataAnchoring(transaction)
        case 'LEGACY':
        default:
            return rlpEncodeForLegacyTransaction(transaction)
    }
}

// case1) sig === [v, r, s]
// case2) sig ===
function makeRawTransaction(rlpEncoded, sig, transaction) {
    const decodedValues = RLP.decode(rlpEncoded)
    let rawTx

    transaction.type = transaction.senderRawTransaction
        ? utils.getTxTypeStringFromRawTransaction(transaction.senderRawTransaction)
        : transaction.type

    switch (transaction.type) {
        case 'ACCOUNT_CREATION':
            throw new Error(creationNotSupportError)
        case 'VALUE_TRANSFER':
        case 'VALUE_TRANSFER_MEMO':
        case 'ACCOUNT_UPDATE':
        case 'SMART_CONTRACT_DEPLOY':
        case 'SMART_CONTRACT_EXECUTION':
        case 'CANCEL':
        case 'CHAIN_DATA_ANCHORING':
            return _combineSenderRawTransaction(rlpEncoded, sig)
        case 'FEE_DELEGATED_VALUE_TRANSFER':
        case 'FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO':
        case 'FEE_DELEGATED_VALUE_TRANSFER_MEMO':
        case 'FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO':
        case 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY':
        case 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO':
        case 'FEE_DELEGATED_CANCEL':
        case 'FEE_DELEGATED_CANCEL_WITH_RATIO':
        case 'FEE_DELEGATED_ACCOUNT_UPDATE':
        case 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO':
        case 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION':
        case 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO': {
            if (transaction.senderRawTransaction) {
                const decoded = decodeFromRawTransaction(transaction.senderRawTransaction)
                return _combineFeePayerRawTransaction(rlpEncoded, sig, transaction, decoded.signatures)
            }
            if (transaction.feePayer && transaction.feePayer !== '0x' && transaction.feePayerSignatures) {
                return _combineFeePayerRawTransaction(rlpEncoded, transaction.feePayerSignatures, transaction, sig)
            }
            return _combineSenderRawTransaction(rlpEncoded, sig)
        }
        case 'LEGACY':
        default:
            rawTx = decodedValues.slice(0, 6).concat(sig[0])
            return {
                rawTransaction: RLP.encode(rawTx),
                signatures: sig[0],
                feePayerSignatures: undefined,
            }
    }
}

function _combineSenderRawTransaction(rlpEncoded, sig) {
    const decodedValues = RLP.decode(rlpEncoded)

    const [data] = decodedValues
    let [txType, ...rawTx] = RLP.decode(data)

    if (!Array.isArray(sig[0])) sig = [sig]
    sig = refineSignatures(sig)

    rawTx = [...rawTx, sig]

    // set default feepayer's information in rawTx
    const typeString = utils.getTxTypeStringFromRawTransaction(txType)
    if (typeString !== undefined && typeString.includes('FEE_DELEGATED')) rawTx = [...rawTx, '0x', [['0x01', '0x', '0x']]]

    return {
        rawTransaction: txType + RLP.encode(rawTx).slice(2),
        signatures: sig,
        feePayerSignatures: undefined,
    }
}

function _combineFeePayerRawTransaction(rlpEncoded, feePayerSignatures, transaction, senderSignature) {
    const decodedValues = RLP.decode(rlpEncoded)

    const [data] = decodedValues
    let [txType, ...rawTx] = RLP.decode(data)

    if (!Array.isArray(feePayerSignatures[0])) feePayerSignatures = [feePayerSignatures]
    senderSignature = refineSignatures(senderSignature)
    feePayerSignatures = refineSignatures(feePayerSignatures)

    rawTx = [...rawTx, senderSignature, transaction.feePayer.toLowerCase(), feePayerSignatures]

    return {
        rawTransaction: txType + RLP.encode(rawTx).slice(2),
        signatures: senderSignature,
        feePayerSignatures,
    }
}

// refineSignatures removes duplication and empty signatures
function refineSignatures(sigArray) {
    const set = new Set()
    let result = []
    for (const sig of sigArray) {
        if (sig.length > 0 && !utils.isEmptySig(sig)) {
            const sigString = sig.join('')
            if (!set.has(sigString)) {
                set.add(sigString, true)
                result.push(sig)
            }
        }
    }

    if (result.length === 0) result = [['0x01', '0x', '0x']]

    return result
}

function extractSignatures(rawTransaction) {
    let senderSignatures = []
    let feePayerSignatures = []

    const decoded = _decodeFromRawTransaction(rawTransaction)
    senderSignatures = senderSignatures.concat(decoded.signatures)
    if (decoded.feePayerSignatures) {
        feePayerSignatures = feePayerSignatures.concat(decoded.feePayerSignatures)
    }
    return { senderSignatures, feePayerSignatures, decodedTransaction: decoded }
}

function splitFeePayer(rawTransaction) {
    const typeString = utils.getTxTypeStringFromRawTransaction(rawTransaction)

    if (!typeString || !typeString.includes('FEE_DELEGATED'))
        throw new Error(`Failed to split fee payer: not a fee delegated transaction type('${typeString || 'LEGACY'}')`)

    const txType = rawTransaction.slice(0, 4)
    const decodedValues = RLP.decode(utils.addHexPrefix(rawTransaction.slice(4)))

    const detachFeePayer = decodedValues.splice(0, decodedValues.length - 2)
    detachFeePayer.push('0x')
    detachFeePayer.push([['0x01', '0x', '0x']])

    return {
        senderRawTransaction: txType + RLP.encode(detachFeePayer).slice(2),
        feePayer: decodedValues[0],
        feePayerSignatures: decodedValues[1],
    }
}

function decodeFromRawTransaction(rawTransaction, type) {
    let decodeResult = _decodeFromRawTransaction(rawTransaction, type)

    switch (decodeResult.type) {
        case 'ACCOUNT_UPDATE':
        case 'FEE_DELEGATED_ACCOUNT_UPDATE':
        case 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO': {
            decodeResult = parseAccountKey(decodeResult)
        }
    }
    return decodeResult
}

function _decodeFromRawTransaction(rawTransaction, type) {
    let typeString = type
    if (typeString === undefined || typeString !== 'LEGACY') {
        typeString = utils.getTxTypeStringFromRawTransaction(rawTransaction)
        if (typeString === undefined) {
            typeString = 'LEGACY'
        } else {
            rawTransaction = `0x${rawTransaction.slice(4)}`
        }
    }

    switch (typeString) {
        case 'LEGACY': {
            const [nonce, gasPrice, gas, to, value, data, v, r, s] = RLP.decode(rawTransaction)
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                to,
                value,
                data,
                v,
                r,
                s,
                signatures: [v, r, s],
            }
        }
        case 'VALUE_TRANSFER': {
            const [nonce, gasPrice, gas, to, value, from, signatures] = RLP.decode(rawTransaction)
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                to,
                value,
                from,
                v: signatures[0][0],
                r: signatures[0][1],
                s: signatures[0][2],
                signatures,
            }
        }
        case 'FEE_DELEGATED_VALUE_TRANSFER': {
            const [nonce, gasPrice, gas, to, value, from, signatures, feePayer, feePayerSignatures] = RLP.decode(rawTransaction)
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                to,
                value,
                from,
                v: signatures[0][0],
                r: signatures[0][1],
                s: signatures[0][2],
                signatures,
                feePayer,
                payerV: feePayerSignatures[0][0],
                payerR: feePayerSignatures[0][1],
                payerS: feePayerSignatures[0][2],
                feePayerSignatures,
            }
        }
        case 'FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO': {
            const [nonce, gasPrice, gas, to, value, from, feeRatio, signatures, feePayer, feePayerSignatures] = RLP.decode(rawTransaction)
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                to,
                value,
                from,
                feeRatio,
                v: signatures[0][0],
                r: signatures[0][1],
                s: signatures[0][2],
                signatures,
                feePayer,
                payerV: feePayerSignatures[0][0],
                payerR: feePayerSignatures[0][1],
                payerS: feePayerSignatures[0][2],
                feePayerSignatures,
            }
        }
        case 'VALUE_TRANSFER_MEMO': {
            const [nonce, gasPrice, gas, to, value, from, data, signatures] = RLP.decode(rawTransaction)
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                to,
                value,
                from,
                data,
                v: signatures[0][0],
                r: signatures[0][1],
                s: signatures[0][2],
                signatures,
            }
        }
        case 'FEE_DELEGATED_VALUE_TRANSFER_MEMO': {
            const [nonce, gasPrice, gas, to, value, from, data, signatures, feePayer, feePayerSignatures] = RLP.decode(rawTransaction)
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                to,
                value,
                from,
                data,
                v: signatures[0][0],
                r: signatures[0][1],
                s: signatures[0][2],
                signatures,
                feePayer,
                payerV: feePayerSignatures[0][0],
                payerR: feePayerSignatures[0][1],
                payerS: feePayerSignatures[0][2],
                feePayerSignatures,
            }
        }
        case 'FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO': {
            const [nonce, gasPrice, gas, to, value, from, data, feeRatio, signatures, feePayer, feePayerSignatures] = RLP.decode(
                rawTransaction
            )
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                to,
                value,
                from,
                data,
                feeRatio,
                v: signatures[0][0],
                r: signatures[0][1],
                s: signatures[0][2],
                signatures,
                feePayer,
                payerV: feePayerSignatures[0][0],
                payerR: feePayerSignatures[0][1],
                payerS: feePayerSignatures[0][2],
                feePayerSignatures,
            }
        }
        case 'ACCOUNT_CREATION': {
            throw new Error(creationNotSupportError)
        }
        case 'ACCOUNT_UPDATE': {
            const [nonce, gasPrice, gas, from, accountKey, signatures] = RLP.decode(rawTransaction)
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                from,
                accountKey,
                v: signatures[0][0],
                r: signatures[0][1],
                s: signatures[0][2],
                signatures,
            }
        }
        case 'FEE_DELEGATED_ACCOUNT_UPDATE': {
            const [nonce, gasPrice, gas, from, accountKey, signatures, feePayer, feePayerSignatures] = RLP.decode(rawTransaction)
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                from,
                accountKey,
                v: signatures[0][0],
                r: signatures[0][1],
                s: signatures[0][2],
                signatures,
                feePayer,
                payerV: feePayerSignatures[0][0],
                payerR: feePayerSignatures[0][1],
                payerS: feePayerSignatures[0][2],
                feePayerSignatures,
            }
        }
        case 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO': {
            const [nonce, gasPrice, gas, from, accountKey, feeRatio, signatures, feePayer, feePayerSignatures] = RLP.decode(rawTransaction)
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                from,
                accountKey,
                feeRatio,
                v: signatures[0][0],
                r: signatures[0][1],
                s: signatures[0][2],
                signatures,
                feePayer,
                payerV: feePayerSignatures[0][0],
                payerR: feePayerSignatures[0][1],
                payerS: feePayerSignatures[0][2],
                feePayerSignatures,
            }
        }
        case 'SMART_CONTRACT_DEPLOY': {
            const [nonce, gasPrice, gas, to, value, from, data, humanReadable, codeFormat, signatures] = RLP.decode(rawTransaction)
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                to,
                value,
                from,
                data,
                humanReadable: humanReadable === '0x01',
                codeFormat,
                v: signatures[0][0],
                r: signatures[0][1],
                s: signatures[0][2],
                signatures,
            }
        }
        case 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY': {
            const [
                nonce,
                gasPrice,
                gas,
                to,
                value,
                from,
                data,
                humanReadable,
                codeFormat,
                signatures,
                feePayer,
                feePayerSignatures,
            ] = RLP.decode(rawTransaction)
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                to,
                value,
                from,
                data,
                humanReadable: humanReadable === '0x01',
                codeFormat,
                v: signatures[0][0],
                r: signatures[0][1],
                s: signatures[0][2],
                signatures,
                feePayer,
                payerV: feePayerSignatures[0][0],
                payerR: feePayerSignatures[0][1],
                payerS: feePayerSignatures[0][2],
                feePayerSignatures,
            }
        }
        case 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO': {
            const [
                nonce,
                gasPrice,
                gas,
                to,
                value,
                from,
                data,
                humanReadable,
                feeRatio,
                codeFormat,
                signatures,
                feePayer,
                feePayerSignatures,
            ] = RLP.decode(rawTransaction)
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                to,
                value,
                from,
                data,
                humanReadable: humanReadable === '0x01',
                feeRatio,
                codeFormat,
                v: signatures[0][0],
                r: signatures[0][1],
                s: signatures[0][2],
                signatures,
                feePayer,
                payerV: feePayerSignatures[0][0],
                payerR: feePayerSignatures[0][1],
                payerS: feePayerSignatures[0][2],
                feePayerSignatures,
            }
        }
        case 'SMART_CONTRACT_EXECUTION': {
            const [nonce, gasPrice, gas, to, value, from, data, signatures] = RLP.decode(rawTransaction)
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                to,
                value,
                from,
                data,
                v: signatures[0][0],
                r: signatures[0][1],
                s: signatures[0][2],
                signatures,
            }
        }
        case 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION': {
            const [nonce, gasPrice, gas, to, value, from, data, signatures, feePayer, feePayerSignatures] = RLP.decode(rawTransaction)
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                to,
                value,
                from,
                data,
                v: signatures[0][0],
                r: signatures[0][1],
                s: signatures[0][2],
                signatures,
                feePayer,
                payerV: feePayerSignatures[0][0],
                payerR: feePayerSignatures[0][1],
                payerS: feePayerSignatures[0][2],
                feePayerSignatures,
            }
        }
        case 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO': {
            const [nonce, gasPrice, gas, to, value, from, data, feeRatio, signatures, feePayer, feePayerSignatures] = RLP.decode(
                rawTransaction
            )
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                to,
                value,
                from,
                data,
                feeRatio,
                v: signatures[0][0],
                r: signatures[0][1],
                s: signatures[0][2],
                signatures,
                feePayer,
                payerV: feePayerSignatures[0][0],
                payerR: feePayerSignatures[0][1],
                payerS: feePayerSignatures[0][2],
                feePayerSignatures,
            }
        }
        case 'CANCEL': {
            const [nonce, gasPrice, gas, from, signatures] = RLP.decode(rawTransaction)
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                from,
                v: signatures[0][0],
                r: signatures[0][1],
                s: signatures[0][2],
                signatures,
            }
        }
        case 'FEE_DELEGATED_CANCEL': {
            const [nonce, gasPrice, gas, from, signatures, feePayer, feePayerSignatures] = RLP.decode(rawTransaction)
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                from,
                v: signatures[0][0],
                r: signatures[0][1],
                s: signatures[0][2],
                signatures,
                feePayer,
                payerV: feePayerSignatures[0][0],
                payerR: feePayerSignatures[0][1],
                payerS: feePayerSignatures[0][2],
                feePayerSignatures,
            }
        }
        case 'FEE_DELEGATED_CANCEL_WITH_RATIO': {
            const [nonce, gasPrice, gas, from, feeRatio, signatures, feePayer, feePayerSignatures] = RLP.decode(rawTransaction)
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                from,
                feeRatio,
                v: signatures[0][0],
                r: signatures[0][1],
                s: signatures[0][2],
                signatures,
                feePayer,
                payerV: feePayerSignatures[0][0],
                payerR: feePayerSignatures[0][1],
                payerS: feePayerSignatures[0][2],
                feePayerSignatures,
            }
        }
        case 'CHAIN_DATA_ANCHORING': {
            const [nonce, gasPrice, gas, to, value, from, data, signatures] = RLP.decode(rawTransaction)
            return {
                type: typeString,
                nonce,
                gasPrice,
                gas,
                to,
                value,
                from,
                anchoredData: data,
                v: signatures[0][0],
                r: signatures[0][1],
                s: signatures[0][2],
                signatures,
            }
        }
    }
}

function overwriteSignature(rawTransaction, txObj, signature, feePayerSignature) {
    if (signature === undefined) {
        signature = [txObj.v, txObj.r, txObj.s]
    }
    if (txObj.type.includes('FEE_DELEGATED') && feePayerSignature === undefined) {
        feePayerSignature = [txObj.payerV, txObj.payerR, txObj.payerS]
    }

    if (txObj.type === 'LEGACY') {
        let decodeLegacy = RLP.decode(rawTransaction)
        decodeLegacy = decodeLegacy.slice(0, 6).concat(signature)
        return RLP.encode(decodeLegacy)
    }

    const type = rawTransaction.slice(0, 4)
    const typeDetached = `0x${rawTransaction.slice(4)}`

    const data = RLP.decode(typeDetached)
    if (txObj.type.includes('FEE_DELEGATED')) {
        data[data.length - 3] = [signature]
        data[data.length - 1] = [feePayerSignature]
    } else {
        data[data.length - 1] = [signature]
    }

    return type + RLP.encode(data).slice(2)
}

function getSenderTxHash(rawTransaction) {
    const typeString = utils.getTxTypeStringFromRawTransaction(rawTransaction)
    if (typeString === undefined || !typeString.includes('FEE_DELEGATED')) return Hash.keccak256(rawTransaction)

    const type = rawTransaction.slice(0, 4)
    const typeDetached = `0x${rawTransaction.slice(4)}`

    const data = RLP.decode(typeDetached)

    return Hash.keccak256(type + RLP.encode(data.slice(0, data.length - 2)).slice(2))
}

module.exports = {
    encodeRLPByTxType,
    makeRawTransaction,
    decodeFromRawTransaction,
    overwriteSignature,
    getSenderTxHash,
    splitFeePayer,
    extractSignatures,
}
