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
 * @typedef {LegacyTransaction|ValueTransfer|FeeDelegatedValueTransfer|FeeDelegatedValueTransferWithRatio|ValueTransferMemo|FeeDelegatedValueTransferMemo|FeeDelegatedValueTransferMemoWithRatio|AccountUpdate|FeeDelegatedAccountUpdate|FeeDelegatedAccountUpdateWithRatio|SmartContractDeploy|FeeDelegatedSmartContractDeploy|FeeDelegatedSmartContractDeployWithRatio|SmartContractExecution|FeeDelegatedSmartContractExecution|FeeDelegatedSmartContractExecution|FeeDelegatedSmartContractExecutionWithRatio|Cancel|FeeDelegatedCancel|FeeDelegatedCancelWithRatio|ChainDataAnchoring|FeeDelegatedChainDataAnchoring|FeeDelegatedChainDataAnchoringWithRatio} module:Transaction.Transaction
 */
/**
 * @typedef {FeeDelegatedValueTransfer|FeeDelegatedValueTransferWithRatio|FeeDelegatedValueTransferMemo|FeeDelegatedValueTransferMemoWithRatio|FeeDelegatedAccountUpdate|FeeDelegatedAccountUpdateWithRatio|FeeDelegatedSmartContractDeploy|FeeDelegatedSmartContractDeployWithRatio|FeeDelegatedSmartContractExecution|FeeDelegatedSmartContractExecution|FeeDelegatedSmartContractExecutionWithRatio|FeeDelegatedCancel|FeeDelegatedCancelWithRatio|FeeDelegatedChainDataAnchoring|FeeDelegatedChainDataAnchoringWithRatio} module:Transaction.FeeDelegatedTransaction
 */
/**
 * Querys transaction from Klaytn and converts to a caver transaction instance.
 * If it fails to receive a transaction from Klaytn, an error is thrown.
 *
 * @example
 * const txObject = await caver.transaction.getTransactionByHash('0x{transaction hash}')
 *
 * @method getTransactionByHash
 * @param  {string} transactionHash The transaction hash string to query from Klaytn.
 * @return {Promise<AbstractTransaction>}
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

    /**
     * The LegacyTransaction class.
     *
     * @example
     * caver.transaction.legacyTransaction
     *
     * @type {typeof LegacyTransaction}
     * */
    legacyTransaction: LegacyTransaction,

    /**
     * The ValueTransfer class.
     *
     * @example
     * caver.transaction.valueTransfer
     *
     * @type {typeof ValueTransfer}
     * */
    valueTransfer: ValueTransfer,
    /**
     * The FeeDelegatedValueTransfer class.
     *
     * @example
     * caver.transaction.feeDelegatedValueTransfer
     *
     * @type {typeof FeeDelegatedValueTransfer}
     * */
    feeDelegatedValueTransfer: FeeDelegatedValueTransfer,
    /**
     * The FeeDelegatedValueTransferWithRatio class.
     *
     * @example
     * caver.transaction.feeDelegatedValueTransferWithRatio
     *
     * @type {typeof FeeDelegatedValueTransferWithRatio}
     * */
    feeDelegatedValueTransferWithRatio: FeeDelegatedValueTransferWithRatio,

    /**
     * The ValueTransferMemo class.
     *
     * @example
     * caver.transaction.valueTransferMemo
     *
     * @type {typeof ValueTransferMemo}
     * */
    valueTransferMemo: ValueTransferMemo,
    /**
     * The FeeDelegatedValueTransferMemo class.
     *
     * @example
     * caver.transaction.feeDelegatedValueTransferMemo
     *
     * @type {typeof FeeDelegatedValueTransferMemo}
     * */
    feeDelegatedValueTransferMemo: FeeDelegatedValueTransferMemo,
    /**
     * The FeeDelegatedValueTransferMemoWithRatio class.
     *
     * @example
     * caver.transaction.feeDelegatedValueTransferMemoWithRatio
     *
     * @type {typeof FeeDelegatedValueTransferMemoWithRatio}
     * */
    feeDelegatedValueTransferMemoWithRatio: FeeDelegatedValueTransferMemoWithRatio,

    /**
     * The AccountUpdate class.
     *
     * @example
     * caver.transaction.accountUpdate
     *
     * @type {typeof AccountUpdate}
     * */
    accountUpdate: AccountUpdate,
    /**
     * The FeeDelegatedAccountUpdate class.
     *
     * @example
     * caver.transaction.feeDelegatedAccountUpdate
     *
     * @type {typeof FeeDelegatedAccountUpdate}
     * */
    feeDelegatedAccountUpdate: FeeDelegatedAccountUpdate,
    /**
     * The FeeDelegatedAccountUpdateWithRatio class.
     *
     * @example
     * caver.transaction.feeDelegatedAccountUpdateWithRatio
     *
     * @type {typeof FeeDelegatedAccountUpdateWithRatio}
     * */
    feeDelegatedAccountUpdateWithRatio: FeeDelegatedAccountUpdateWithRatio,

    /**
     * The SmartContractDeploy class.
     *
     * @example
     * caver.transaction.smartContractDeploy
     *
     * @type {typeof SmartContractDeploy}
     * */
    smartContractDeploy: SmartContractDeploy,
    /**
     * The FeeDelegatedSmartContractDeploy class.
     *
     * @example
     * caver.transaction.feeDelegatedSmartContractDeploy
     *
     * @type {typeof FeeDelegatedSmartContractDeploy}
     * */
    feeDelegatedSmartContractDeploy: FeeDelegatedSmartContractDeploy,
    /**
     * The FeeDelegatedSmartContractDeployWithRatio class.
     *
     * @example
     * caver.transaction.feeDelegatedSmartContractDeployWithRatio
     *
     * @type {typeof FeeDelegatedSmartContractDeployWithRatio}
     * */
    feeDelegatedSmartContractDeployWithRatio: FeeDelegatedSmartContractDeployWithRatio,

    /**
     * The SmartContractExecution class.
     *
     * @example
     * caver.transaction.smartContractExecution
     *
     * @type {typeof SmartContractExecution}
     * */
    smartContractExecution: SmartContractExecution,
    /**
     * The FeeDelegatedSmartContractExecution class.
     *
     * @example
     * caver.transaction.feeDelegatedSmartContractExecution
     *
     * @type {typeof FeeDelegatedSmartContractExecution}
     * */
    feeDelegatedSmartContractExecution: FeeDelegatedSmartContractExecution,
    /**
     * The FeeDelegatedSmartContractExecutionWithRatio class.
     *
     * @example
     * caver.transaction.feeDelegatedSmartContractExecutionWithRatio
     *
     * @type {typeof FeeDelegatedSmartContractExecutionWithRatio}
     * */
    feeDelegatedSmartContractExecutionWithRatio: FeeDelegatedSmartContractExecutionWithRatio,

    /**
     * The Cancel class.
     *
     * @example
     * caver.transaction.cancel
     *
     * @type {typeof Cancel}
     * */
    cancel: Cancel,
    /**
     * The FeeDelegatedCancel class.
     *
     * @example
     * caver.transaction.feeDelegatedCancel
     *
     * @type {typeof FeeDelegatedCancel}
     * */
    feeDelegatedCancel: FeeDelegatedCancel,
    /**
     * The FeeDelegatedCancelWithRatio class.
     *
     * @example
     * caver.transaction.feeDelegatedCancelWithRatio
     *
     * @type {typeof FeeDelegatedCancelWithRatio}
     * */
    feeDelegatedCancelWithRatio: FeeDelegatedCancelWithRatio,

    /**
     * The ChainDataAnchoring class.
     *
     * @example
     * caver.transaction.chainDataAnchoring
     *
     * @type {typeof ChainDataAnchoring}
     * */
    chainDataAnchoring: ChainDataAnchoring,
    /**
     * The FeeDelegatedChainDataAnchoring class.
     *
     * @example
     * caver.transaction.feeDelegatedChainDataAnchoring
     *
     * @type {typeof FeeDelegatedChainDataAnchoring}
     * */
    feeDelegatedChainDataAnchoring: FeeDelegatedChainDataAnchoring,
    /**
     * The FeeDelegatedChainDataAnchoringWithRatio class.
     *
     * @example
     * caver.transaction.feeDelegatedChainDataAnchoringWithRatio
     *
     * @type {typeof FeeDelegatedChainDataAnchoringWithRatio}
     * */
    feeDelegatedChainDataAnchoringWithRatio: FeeDelegatedChainDataAnchoringWithRatio,

    type: TX_TYPE_STRING,
    tag: TX_TYPE_TAG,
}
