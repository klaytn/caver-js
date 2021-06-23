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

const LegacyTransaction = require('./transactionTypes/legacyTransaction/legacyTransaction')
const ValueTransfer = require('./transactionTypes/valueTransfer/valueTransfer')
const FeeDelegatedValueTransfer = require('./transactionTypes/valueTransfer/feeDelegatedValueTransfer')
const FeeDelegatedValueTransferWithRatio = require('./transactionTypes/valueTransfer/feeDelegatedValueTransferWithRatio')
const ValueTransferMemo = require('./transactionTypes/valueTransferMemo/valueTransferMemo')
const FeeDelegatedValueTransferMemo = require('./transactionTypes/valueTransferMemo/feeDelegatedValueTransferMemo')
const FeeDelegatedValueTransferMemoWithRatio = require('./transactionTypes/valueTransferMemo/feeDelegatedValueTransferMemoWithRatio')
const AccountUpdate = require('./transactionTypes/accountUpdate/accountUpdate')
const FeeDelegatedAccountUpdate = require('./transactionTypes/accountUpdate/feeDelegatedAccountUpdate')
const FeeDelegatedAccountUpdateWithRatio = require('./transactionTypes/accountUpdate/feeDelegatedAccountUpdateWithRatio')
const SmartContractDeploy = require('./transactionTypes/smartContractDeploy/smartContractDeploy')
const FeeDelegatedSmartContractDeploy = require('./transactionTypes/smartContractDeploy/feeDelegatedSmartContractDeploy')
const FeeDelegatedSmartContractDeployWithRatio = require('./transactionTypes/smartContractDeploy/feeDelegatedSmartContractDeployWithRatio')
const SmartContractExecution = require('./transactionTypes/smartContractExecution/smartContractExecution')
const FeeDelegatedSmartContractExecution = require('./transactionTypes/smartContractExecution/feeDelegatedSmartContractExecution')
const FeeDelegatedSmartContractExecutionWithRatio = require('./transactionTypes/smartContractExecution/feeDelegatedSmartContractExecutionWithRatio')
const Cancel = require('./transactionTypes/cancel/cancel')
const FeeDelegatedCancel = require('./transactionTypes/cancel/feeDelegatedCancel')
const FeeDelegatedCancelWithRatio = require('./transactionTypes/cancel/feeDelegatedCancelWithRatio')
const ChainDataAnchoring = require('./transactionTypes/chainDataAnchoring/chainDataAnchoring')
const FeeDelegatedChainDataAnchoring = require('./transactionTypes/chainDataAnchoring/feeDelegatedChainDataAnchoring')
const FeeDelegatedChainDataAnchoringWithRatio = require('./transactionTypes/chainDataAnchoring/feeDelegatedChainDataAnchoringWithRatio')
const TransactionDecoder = require('./transactionDecoder/transactionDecoder')
const AbstractTransaction = require('./transactionTypes/abstractTransaction')
const { TX_TYPE_STRING, TX_TYPE_TAG } = require('./transactionHelper/transactionHelper')
const Account = require('../../caver-account')
const AbstractFeeDelegatedTransaction = require('./transactionTypes/abstractFeeDelegatedTransaction')

/** @module Transaction */

/**
 * Querys transaction from Klaytn and converts to a caver transaction instance.
 * If it fails to receive a transaction from Klaytn, an error is thrown.
 *
 * @example
 * const txObject = await caver.transaction.getTransactionByHash('0x{transaction hash}')
 *
 * @method getTransactionByHash
 * @param  {string} transactionHash The transaction hash string to query from Klaytn.
 * @return {AbstractTransaction}
 */
async function getTransactionByHash(transactionHash) {
    let txObject = await AbstractTransaction._klaytnCall.getTransactionByHash(transactionHash)
    if (txObject === null) throw new Error(`Failed to get transaction from Klaytn with '${transactionHash}'.`)

    // AccountUpdate transaction received from Klaytn defines encodedAccountKey string in `key` field.
    // This needs to be formatted according to the caver transaction format (`account` field).
    if (txObject.key) {
        const account = Account.createFromRLPEncoding(txObject.from, txObject.key)
        txObject.account = account
        delete txObject.key
    }

    switch (txObject.type) {
        case 'TxTypeLegacyTransaction':
            txObject = new LegacyTransaction(txObject)
            break
        case 'TxTypeValueTransfer':
            txObject = new ValueTransfer(txObject)
            break
        case 'TxTypeFeeDelegatedValueTransfer':
            txObject = new FeeDelegatedValueTransfer(txObject)
            break
        case 'TxTypeFeeDelegatedValueTransferWithRatio':
            txObject = new FeeDelegatedValueTransferWithRatio(txObject)
            break
        case 'TxTypeValueTransferMemo':
            txObject = new ValueTransferMemo(txObject)
            break
        case 'TxTypeFeeDelegatedValueTransferMemo':
            txObject = new FeeDelegatedValueTransferMemo(txObject)
            break
        case 'TxTypeFeeDelegatedValueTransferMemoWithRatio':
            txObject = new FeeDelegatedValueTransferMemoWithRatio(txObject)
            break
        case 'TxTypeAccountUpdate':
            txObject = new AccountUpdate(txObject)
            break
        case 'TxTypeFeeDelegatedAccountUpdate':
            txObject = new FeeDelegatedAccountUpdate(txObject)
            break
        case 'TxTypeFeeDelegatedAccountUpdateWithRatio':
            txObject = new FeeDelegatedAccountUpdateWithRatio(txObject)
            break
        case 'TxTypeSmartContractDeploy':
            txObject = new SmartContractDeploy(txObject)
            break
        case 'TxTypeFeeDelegatedSmartContractDeploy':
            txObject = new FeeDelegatedSmartContractDeploy(txObject)
            break
        case 'TxTypeFeeDelegatedSmartContractDeployWithRatio':
            txObject = new FeeDelegatedSmartContractDeployWithRatio(txObject)
            break
        case 'TxTypeSmartContractExecution':
            txObject = new SmartContractExecution(txObject)
            break
        case 'TxTypeFeeDelegatedSmartContractExecution':
            txObject = new FeeDelegatedSmartContractExecution(txObject)
            break
        case 'TxTypeFeeDelegatedSmartContractExecutionWithRatio':
            txObject = new FeeDelegatedSmartContractExecutionWithRatio(txObject)
            break
        case 'TxTypeCancel':
            txObject = new Cancel(txObject)
            break
        case 'TxTypeFeeDelegatedCancel':
            txObject = new FeeDelegatedCancel(txObject)
            break
        case 'TxTypeFeeDelegatedCancelWithRatio':
            txObject = new FeeDelegatedCancelWithRatio(txObject)
            break
        case 'TxTypeChainDataAnchoring':
            txObject = new ChainDataAnchoring(txObject)
            break
        case 'TxTypeFeeDelegatedChainDataAnchoring':
            txObject = new FeeDelegatedChainDataAnchoring(txObject)
            break
        case 'TxTypeFeeDelegatedChainDataAnchoringWithRatio':
            txObject = new FeeDelegatedChainDataAnchoringWithRatio(txObject)
            break
    }
    return txObject
}

/**
 * Recovers the public key strings from `signatures` field.
 * If you want to derive an address from public key, please use `caver.utils.publicKeyToAddress`.
 *
 * @example
 * const publicKey = caver.transaction.recoverPublicKeys('0x{RLP-encoded transaction string}')
 *
 * @method recoverPublicKeys
 * @param  {string} rawTx The RLP-encoded transaction string to recover public keys from `signatures`.
 * @return {Array.<string>}
 */
function recoverPublicKeys(rawTx) {
    const tx = TransactionDecoder.decode(rawTx)
    return tx.recoverPublicKeys()
}

/**
 * Recovers the public key strings from `feePayerSignatures` field.
 * If you want to derive an address from public key, please use `caver.utils.publicKeyToAddress`.
 *
 * @example
 * const publicKey = caver.transaction.recoverFeePayerPublicKeys()
 *
 * @method recoverFeePayerPublicKeys
 * @param  {string} rawTx The RLP-encoded transaction string to recover public keys from `feePayerSignatures`.
 * @return {Array.<string>}
 */
function recoverFeePayerPublicKeys(rawTx) {
    const tx = TransactionDecoder.decode(rawTx)
    if (!(tx instanceof AbstractFeeDelegatedTransaction))
        throw new Error(
            'The `caver.transaction.recoverFeePayerPublicKeys` function can only use with fee delegation transaction. For basic transactions, use `caver.transaction.recoverPublicKeys`.'
        )
    return tx.recoverFeePayerPublicKeys()
}

module.exports = {
    decode: TransactionDecoder.decode,
    getTransactionByHash: getTransactionByHash,
    recoverPublicKeys: recoverPublicKeys,
    recoverFeePayerPublicKeys: recoverFeePayerPublicKeys,

    legacyTransaction: LegacyTransaction,

    valueTransfer: ValueTransfer,
    feeDelegatedValueTransfer: FeeDelegatedValueTransfer,
    feeDelegatedValueTransferWithRatio: FeeDelegatedValueTransferWithRatio,

    valueTransferMemo: ValueTransferMemo,
    feeDelegatedValueTransferMemo: FeeDelegatedValueTransferMemo,
    feeDelegatedValueTransferMemoWithRatio: FeeDelegatedValueTransferMemoWithRatio,

    accountUpdate: AccountUpdate,
    feeDelegatedAccountUpdate: FeeDelegatedAccountUpdate,
    feeDelegatedAccountUpdateWithRatio: FeeDelegatedAccountUpdateWithRatio,

    smartContractDeploy: SmartContractDeploy,
    feeDelegatedSmartContractDeploy: FeeDelegatedSmartContractDeploy,
    feeDelegatedSmartContractDeployWithRatio: FeeDelegatedSmartContractDeployWithRatio,

    smartContractExecution: SmartContractExecution,
    feeDelegatedSmartContractExecution: FeeDelegatedSmartContractExecution,
    feeDelegatedSmartContractExecutionWithRatio: FeeDelegatedSmartContractExecutionWithRatio,

    cancel: Cancel,
    feeDelegatedCancel: FeeDelegatedCancel,
    feeDelegatedCancelWithRatio: FeeDelegatedCancelWithRatio,

    chainDataAnchoring: ChainDataAnchoring,
    feeDelegatedChainDataAnchoring: FeeDelegatedChainDataAnchoring,
    feeDelegatedChainDataAnchoringWithRatio: FeeDelegatedChainDataAnchoringWithRatio,

    type: TX_TYPE_STRING,
    tag: TX_TYPE_TAG,
}
