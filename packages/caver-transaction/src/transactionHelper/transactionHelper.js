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

/**
 * The transaction type strings.
 *
 * @example
 * caver.transaction.type.TxTypeLegacyTransaction
 * caver.transaction.type.TxTypeValueTransfer
 * caver.transaction.type.TxTypeFeeDelegatedValueTransfer
 * caver.transaction.type.TxTypeFeeDelegatedValueTransferWithRatio
 * caver.transaction.type.TxTypeValueTransferMemo
 * caver.transaction.type.TxTypeFeeDelegatedValueTransferMemo
 * caver.transaction.type.TxTypeFeeDelegatedValueTransferMemoWithRatio
 * caver.transaction.type.TxTypeAccountUpdate
 * caver.transaction.type.TxTypeFeeDelegatedAccountUpdate
 * caver.transaction.type.TxTypeFeeDelegatedAccountUpdateWithRatio
 * caver.transaction.type.TxTypeSmartContractDeploy
 * caver.transaction.type.TxTypeFeeDelegatedSmartContractDeploy
 * caver.transaction.type.TxTypeFeeDelegatedSmartContractDeployWithRatio
 * caver.transaction.type.TxTypeSmartContractExecution
 * caver.transaction.type.TxTypeFeeDelegatedSmartContractExecution
 * caver.transaction.type.TxTypeFeeDelegatedSmartContractExecutionWithRatio
 * caver.transaction.type.TxTypeCancel
 * caver.transaction.type.TxTypeFeeDelegatedCancel
 * caver.transaction.type.TxTypeFeeDelegatedCancelWithRatio
 * caver.transaction.type.TxTypeChainDataAnchoring
 * caver.transaction.type.TxTypeFeeDelegatedChainDataAnchoring
 * caver.transaction.type.TxTypeFeeDelegatedChainDataAnchoringWithRatio
 *
 * @alias module:Transaction.type
 * @type {Map<string:string>}
 */
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

/**
 * The transaction tag hex strings.
 * This is because the transaction type tag string and the transaction type string are mapped, so the transaction type tag can be used as a key value.
 *
 * @example
 * caver.transaction.tag.TxTypeLegacyTransaction // caver.transaction.tag['']
 * caver.transaction.tag.TxTypeValueTransfer // caver.transaction.tag['0x08']
 * caver.transaction.tag.TxTypeFeeDelegatedValueTransfer // caver.transaction.tag['0x09']
 * caver.transaction.tag.TxTypeFeeDelegatedValueTransferWithRatio // caver.transaction.tag['0x0a']
 * caver.transaction.tag.TxTypeValueTransferMemo // caver.transaction.tag['0x10']
 * caver.transaction.tag.TxTypeFeeDelegatedValueTransferMemo // caver.transaction.tag['0x11']
 * caver.transaction.tag.TxTypeFeeDelegatedValueTransferMemoWithRatio // caver.transaction.tag['0x12']
 * caver.transaction.tag.TxTypeAccountUpdate // caver.transaction.tag['0x20']
 * caver.transaction.tag.TxTypeFeeDelegatedAccountUpdate // caver.transaction.tag['0x21']
 * caver.transaction.tag.TxTypeFeeDelegatedAccountUpdateWithRatio // caver.transaction.tag['0x22']
 * caver.transaction.tag.TxTypeSmartContractDeploy // caver.transaction.tag['0x28']
 * caver.transaction.tag.TxTypeFeeDelegatedSmartContractDeploy // caver.transaction.tag['0x29']
 * caver.transaction.tag.TxTypeFeeDelegatedSmartContractDeployWithRatio // caver.transaction.tag['0x2a']
 * caver.transaction.tag.TxTypeSmartContractExecution // caver.transaction.tag['0x30']
 * caver.transaction.tag.TxTypeFeeDelegatedSmartContractExecution // caver.transaction.tag['0x31']
 * caver.transaction.tag.TxTypeFeeDelegatedSmartContractExecutionWithRatio // caver.transaction.tag['0x32']
 * caver.transaction.tag.TxTypeCancel // caver.transaction.tag['0x38']
 * caver.transaction.tag.TxTypeFeeDelegatedCancel // caver.transaction.tag['0x39']
 * caver.transaction.tag.TxTypeFeeDelegatedCancelWithRatio // caver.transaction.tag['0x3a']
 * caver.transaction.tag.TxTypeChainDataAnchoring // caver.transaction.tag['0x48']
 * caver.transaction.tag.TxTypeFeeDelegatedChainDataAnchoring // caver.transaction.tag['0x49']
 * caver.transaction.tag.TxTypeFeeDelegatedChainDataAnchoringWithRatio // caver.transaction.tag['0x4a']
 *
 * @alias module:Transaction.type
 * @type {Map<string:string>}
 */
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
