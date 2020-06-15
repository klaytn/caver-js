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

const _ = require('lodash')
const utils = require('../../../caver-utils/src')
const SignatureData = require('../../../caver-wallet/src/keyring/signatureData')

const TX_TYPE_STRING = {
    TxTypeLegacyTransaction: 'TxTypeLegacyTransaction',

    TxTypeValueTransfer: 'TxTypeValueTransfer',
    TxTypeFeeDelegatedValueTransfer: 'TxTypeFeeDelegatedValueTransfer',
    TxTypeFeeDelegatedValueTransferWithRatio: 'TxTypeFeeDelegatedValueTransferWithRatio',

    TxTypeValueTransferMemo: 'TxTypeValueTransferMemo',
    TxTypeFeeDelegatedValueTransferMemo: 'TxTypeFeeDelegatedValueTransferMemo',
    TxTypeFeeDelegatedValueTransferMemoWithRatio: 'TxTypeFeeDelegatedValueTransferMemoWithRatio',

    TxTypeAccountUpdate: 'TxTypeAccountUpdate',
    TxTypeFeeDelegatedAccountUpdate: 'TxTypeFeeDelegatedAccountUpdate',
    TxTypeFeeDelegatedAccountUpdateWithRatio: 'TxTypeFeeDelegatedAccountUpdateWithRatio',

    TxTypeSmartContractDeploy: 'TxTypeSmartContractDeploy',
    TxTypeFeeDelegatedSmartContractDeploy: 'TxTypeFeeDelegatedSmartContractDeploy',
    TxTypeFeeDelegatedSmartContractDeployWithRatio: 'TxTypeFeeDelegatedSmartContractDeployWithRatio',

    TxTypeSmartContractExecution: 'TxTypeSmartContractExecution',
    TxTypeFeeDelegatedSmartContractExecution: 'TxTypeFeeDelegatedSmartContractExecution',
    TxTypeFeeDelegatedSmartContractExecutionWithRatio: 'TxTypeFeeDelegatedSmartContractExecutionWithRatio',

    TxTypeCancel: 'TxTypeCancel',
    TxTypeFeeDelegatedCancel: 'TxTypeFeeDelegatedCancel',
    TxTypeFeeDelegatedCancelWithRatio: 'TxTypeFeeDelegatedCancelWithRatio',

    TxTypeChainDataAnchoring: 'TxTypeChainDataAnchoring',
    TxTypeFeeDelegatedChainDataAnchoring: 'TxTypeFeeDelegatedChainDataAnchoring',
    TxTypeFeeDelegatedChainDataAnchoringWithRatio: 'TxTypeFeeDelegatedChainDataAnchoringWithRatio',
}

const TX_TYPE_TAG = {
    TxTypeLegacyTransaction: '',
    '': TX_TYPE_STRING.TxTypeLegacyTransaction,

    TxTypeValueTransfer: '0x08',
    '0x08': TX_TYPE_STRING.TxTypeValueTransfer,
    TxTypeFeeDelegatedValueTransfer: '0x09',
    '0x09': TX_TYPE_STRING.TxTypeFeeDelegatedValueTransfer,
    TxTypeFeeDelegatedValueTransferWithRatio: '0x0a',
    '0x0a': TX_TYPE_STRING.TxTypeFeeDelegatedValueTransferWithRatio,

    TxTypeValueTransferMemo: '0x10',
    '0x10': TX_TYPE_STRING.TxTypeValueTransferMemo,
    TxTypeFeeDelegatedValueTransferMemo: '0x11',
    '0x11': TX_TYPE_STRING.TxTypeFeeDelegatedValueTransferMemo,
    TxTypeFeeDelegatedValueTransferMemoWithRatio: '0x12',
    '0x12': TX_TYPE_STRING.TxTypeFeeDelegatedValueTransferMemoWithRatio,

    TxTypeAccountUpdate: '0x20',
    '0x20': TX_TYPE_STRING.TxTypeAccountUpdate,
    TxTypeFeeDelegatedAccountUpdate: '0x21',
    '0x21': TX_TYPE_STRING.TxTypeFeeDelegatedAccountUpdate,
    TxTypeFeeDelegatedAccountUpdateWithRatio: '0x22',
    '0x22': TX_TYPE_STRING.TxTypeFeeDelegatedAccountUpdateWithRatio,

    TxTypeSmartContractDeploy: '0x28',
    '0x28': TX_TYPE_STRING.TxTypeSmartContractDeploy,
    TxTypeFeeDelegatedSmartContractDeploy: '0x29',
    '0x29': TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy,
    TxTypeFeeDelegatedSmartContractDeployWithRatio: '0x2a',
    '0x2a': TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio,

    TxTypeSmartContractExecution: '0x30',
    '0x30': TX_TYPE_STRING.TxTypeSmartContractExecution,
    TxTypeFeeDelegatedSmartContractExecution: '0x31',
    '0x31': TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution,
    TxTypeFeeDelegatedSmartContractExecutionWithRatio: '0x32',
    '0x32': TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio,

    TxTypeCancel: '0x38',
    '0x38': TX_TYPE_STRING.TxTypeCancel,
    TxTypeFeeDelegatedCancel: '0x39',
    '0x39': TX_TYPE_STRING.TxTypeFeeDelegatedCancel,
    TxTypeFeeDelegatedCancelWithRatio: '0x3a',
    '0x3a': TX_TYPE_STRING.TxTypeFeeDelegatedCancelWithRatio,

    TxTypeChainDataAnchoring: '0x48',
    '0x48': TX_TYPE_STRING.TxTypeChainDataAnchoring,
    TxTypeFeeDelegatedChainDataAnchoring: '0x49',
    '0x49': TX_TYPE_STRING.TxTypeFeeDelegatedChainDataAnchoring,
    TxTypeFeeDelegatedChainDataAnchoringWithRatio: '0x4a',
    '0x4a': TX_TYPE_STRING.TxTypeFeeDelegatedChainDataAnchoringWithRatio,
}

const CODE_FORMAT = {
    EVM: '0x0',
}

/**
 * Returns transaction type number.
 *
 * @param {string} type - A transaction type string.
 * @return {number}
 */
const getTypeInt = type => {
    return utils.hexToNumber(TX_TYPE_TAG[type])
}

/**
 * Refines the array containing signatures.
 * - Removes duplicate signatures.
 * - Removes the default empty signature(['0x01', '0x', '0x']) included with other signatures.
 * - For an empty signature array, return an array containing the default empty signature(['0x01', '0x', '0x']).
 *
 * @param {Array.<string>|Array.<Array.<string>>|SignatureData|Array.<SignatureData>} sigArray - A signature or an array of signatures.
 * @param {boolean} [isLegacy] - Whether 'LegacyTransaction' or not.
 * @return {SignatureData|Array.<SignatureData>}
 */
const refineSignatures = (sigArray, isLegacy = false) => {
    const set = new Set()
    let result = []

    let arrayOfSignatures = sigArray
    if (!_.isArray(sigArray) && sigArray instanceof SignatureData) {
        arrayOfSignatures = [sigArray]
    } else if (_.isArray(sigArray) && _.isString(sigArray[0])) {
        arrayOfSignatures = [sigArray]
    }
    for (const sig of arrayOfSignatures) {
        const signatureData = new SignatureData(sig)
        if (!signatureData.isEmpty()) {
            const sigString = sig.toString()
            if (!set.has(sigString)) {
                set.add(sigString, true)
                result.push(signatureData)
            }
        }
    }
    if (result.length === 0) result = [SignatureData.emtpySig]

    if (isLegacy && result.length > 1) throw new Error(`${TX_TYPE_STRING.TxTypeLegacyTransaction} cannot have multiple sigantures.`)

    return !isLegacy ? result : result[0]
}

/**
 * Returns transaction type string.
 *
 * @param {string} rlpEncoded - An RLP-encoded transaction string.
 * @return {string}
 */
const typeDetectionFromRLPEncoding = rlpEncoded => {
    const typeTag = utils.addHexPrefix(rlpEncoded).slice(0, 4)
    return TX_TYPE_TAG[typeTag] ? TX_TYPE_TAG[typeTag] : TX_TYPE_STRING.TxTypeLegacyTransaction
}

/**
 * Returns code format tag string.
 *
 * @param {string|number} cf - The code format.
 * @return {string}
 */
const getCodeFormatTag = cf => {
    if (cf === undefined) return CODE_FORMAT.EVM
    switch (cf) {
        case 0:
        case '0x':
        case '0x0':
        case 'EVM':
            return CODE_FORMAT.EVM
    }
    throw new Error(`Unsupported code format : ${cf}`)
}

module.exports = {
    TX_TYPE_STRING,
    TX_TYPE_TAG,
    CODE_FORMAT,
    refineSignatures,
    typeDetectionFromRLPEncoding,
    getCodeFormatTag,
    getTypeInt,
}
