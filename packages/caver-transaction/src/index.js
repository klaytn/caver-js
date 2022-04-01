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

/* eslint-disable no-unused-vars */
const LegacyTransaction = require('./transactionTypes/legacyTransaction/legacyTransaction')
const EthereumAccessList = require('./transactionTypes/ethereumTypedTransaction/ethereumAccessList')
const EthereumDynamicFee = require('./transactionTypes/ethereumTypedTransaction/ethereumDynamicFee')
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
const LegacyTransactionWrapper = require('./transactionTypes/wrappers/legacyTransactionWrapper')
const EthereumAccessListWrapper = require('./transactionTypes/wrappers/ethereumAccessListWrapper')
const EthereumDynamicFeeWrapper = require('./transactionTypes/wrappers/ethereumDynamicFeeWrapper')
const ValueTransferWrapper = require('./transactionTypes/wrappers/valueTransferWrapper')
const FeeDelegatedValueTransferWrapper = require('./transactionTypes/wrappers/feeDelegatedValueTransferWrapper')
const FeeDelegatedValueTransferWithRatioWrapper = require('./transactionTypes/wrappers/feeDelegatedValueTransferWithRatioWrapper')
const ValueTransferMemoWrapper = require('./transactionTypes/wrappers/valueTransferMemoWrapper')
const FeeDelegatedValueTransferMemoWrapper = require('./transactionTypes/wrappers/feeDelegatedValueTransferMemoWrapper')
const FeeDelegatedValueTransferMemoWithRatioWrapper = require('./transactionTypes/wrappers/feeDelegatedValueTransferMemoWithRatioWrapper')
const AccountUpdateWrapper = require('./transactionTypes/wrappers/accountUpdateWrapper')
const FeeDelegatedAccountUpdateWrapper = require('./transactionTypes/wrappers/feeDelegatedAccountUpdateWrapper')
const FeeDelegatedAccountUpdateWithRatioWrapper = require('./transactionTypes/wrappers/feeDelegatedAccountUpdateWithRatioWrapper')
const SmartContractDeployWrapper = require('./transactionTypes/wrappers/smartContractDeployWrapper')
const FeeDelegatedSmartContractDeployWrapper = require('./transactionTypes/wrappers/feeDelegatedSmartContractDeployWrapper')
const FeeDelegatedSmartContractDeployWithRatioWrapper = require('./transactionTypes/wrappers/feeDelegatedSmartContractDeployWithRatioWrapper')
const SmartContractExecutionWrapper = require('./transactionTypes/wrappers/smartContractExecutionWrapper')
const FeeDelegatedSmartContractExecutionWrapper = require('./transactionTypes/wrappers/feeDelegatedSmartContractExecutionWrapper')
const FeeDelegatedSmartContractExecutionWithRatioWrapper = require('./transactionTypes/wrappers/feeDelegatedSmartContractExecutionWithRatioWrapper')
const CancelWrapper = require('./transactionTypes/wrappers/cancelWrapper')
const FeeDelegatedCancelWrapper = require('./transactionTypes/wrappers/feeDelegatedCancelWrapper')
const FeeDelegatedCancelWithRatioWrapper = require('./transactionTypes/wrappers/feeDelegatedCancelWithRatioWrapper')
const ChainDataAnchoringWrapper = require('./transactionTypes/wrappers/chainDataAnchoringWrapper')
const FeeDelegatedChainDataAnchoringWrapper = require('./transactionTypes/wrappers/feeDelegatedChainDataAnchoringWrapper')
const FeeDelegatedChainDataAnchoringWithRatioWrapper = require('./transactionTypes/wrappers/feeDelegatedChainDataAnchoringWithRatioWrapper')
const TransactionDecoder = require('./transactionDecoder/transactionDecoder')
const AbstractTransaction = require('./transactionTypes/abstractTransaction')
const { TX_TYPE_STRING, TX_TYPE_TAG } = require('./transactionHelper/transactionHelper')
const Account = require('../../caver-account')
const AbstractFeeDelegatedTransaction = require('./transactionTypes/abstractFeeDelegatedTransaction')
const AccessList = require('./utils/accessList')
const AccessTuple = require('./utils/accessTuple')

/**
 * @typedef {LegacyTransaction|ValueTransfer|FeeDelegatedValueTransfer|FeeDelegatedValueTransferWithRatio|ValueTransferMemo|FeeDelegatedValueTransferMemo|FeeDelegatedValueTransferMemoWithRatio|AccountUpdate|FeeDelegatedAccountUpdate|FeeDelegatedAccountUpdateWithRatio|SmartContractDeploy|FeeDelegatedSmartContractDeploy|FeeDelegatedSmartContractDeployWithRatio|SmartContractExecution|FeeDelegatedSmartContractExecution|FeeDelegatedSmartContractExecution|FeeDelegatedSmartContractExecutionWithRatio|Cancel|FeeDelegatedCancel|FeeDelegatedCancelWithRatio|ChainDataAnchoring|FeeDelegatedChainDataAnchoring|FeeDelegatedChainDataAnchoringWithRatio|EthereumAccessList|EthereumDynamicFee} module:Transaction.Transaction
 */
/**
 * @typedef {FeeDelegatedValueTransfer|FeeDelegatedValueTransferWithRatio|FeeDelegatedValueTransferMemo|FeeDelegatedValueTransferMemoWithRatio|FeeDelegatedAccountUpdate|FeeDelegatedAccountUpdateWithRatio|FeeDelegatedSmartContractDeploy|FeeDelegatedSmartContractDeployWithRatio|FeeDelegatedSmartContractExecution|FeeDelegatedSmartContractExecution|FeeDelegatedSmartContractExecutionWithRatio|FeeDelegatedCancel|FeeDelegatedCancelWithRatio|FeeDelegatedChainDataAnchoring|FeeDelegatedChainDataAnchoringWithRatio} module:Transaction.FeeDelegatedTransaction
 */

/**
 * A class that manages instances of the transaction wrapper and other functions provided by the transaction module.
 * @class
 * @hideconstructor
 */
class TransactionModule {
    /**
     * Creates a TransactionModule.
     *
     * @constructor
     * @param {object} klaytnCall - An object includes klay rpc calls.
     */
    constructor(klaytnCall) {
        if (!klaytnCall) throw new Error(`Invalid constructor parameter: klaytnCall is undefined.`)

        this.klaytnCall = klaytnCall
        this.legacyTransaction = new LegacyTransactionWrapper(this.klaytnCall)
        this.ethereumAccessList = new EthereumAccessListWrapper(this.klaytnCall)
        this.ethereumDynamicFee = new EthereumDynamicFeeWrapper(this.klaytnCall)
        this.valueTransfer = new ValueTransferWrapper(this.klaytnCall)
        this.feeDelegatedValueTransfer = new FeeDelegatedValueTransferWrapper(this.klaytnCall)
        this.feeDelegatedValueTransferWithRatio = new FeeDelegatedValueTransferWithRatioWrapper(this.klaytnCall)
        this.valueTransferMemo = new ValueTransferMemoWrapper(this.klaytnCall)
        this.feeDelegatedValueTransferMemo = new FeeDelegatedValueTransferMemoWrapper(this.klaytnCall)
        this.feeDelegatedValueTransferMemoWithRatio = new FeeDelegatedValueTransferMemoWithRatioWrapper(this.klaytnCall)
        this.accountUpdate = new AccountUpdateWrapper(this.klaytnCall)
        this.feeDelegatedAccountUpdate = new FeeDelegatedAccountUpdateWrapper(this.klaytnCall)
        this.feeDelegatedAccountUpdateWithRatio = new FeeDelegatedAccountUpdateWithRatioWrapper(this.klaytnCall)
        this.smartContractDeploy = new SmartContractDeployWrapper(this.klaytnCall)
        this.feeDelegatedSmartContractDeploy = new FeeDelegatedSmartContractDeployWrapper(this.klaytnCall)
        this.feeDelegatedSmartContractDeployWithRatio = new FeeDelegatedSmartContractDeployWithRatioWrapper(this.klaytnCall)
        this.smartContractExecution = new SmartContractExecutionWrapper(this.klaytnCall)
        this.feeDelegatedSmartContractExecution = new FeeDelegatedSmartContractExecutionWrapper(this.klaytnCall)
        this.feeDelegatedSmartContractExecutionWithRatio = new FeeDelegatedSmartContractExecutionWithRatioWrapper(this.klaytnCall)
        this.cancel = new CancelWrapper(this.klaytnCall)
        this.feeDelegatedCancel = new FeeDelegatedCancelWrapper(this.klaytnCall)
        this.feeDelegatedCancelWithRatio = new FeeDelegatedCancelWithRatioWrapper(this.klaytnCall)
        this.chainDataAnchoring = new ChainDataAnchoringWrapper(this.klaytnCall)
        this.feeDelegatedChainDataAnchoring = new FeeDelegatedChainDataAnchoringWrapper(this.klaytnCall)
        this.feeDelegatedChainDataAnchoringWithRatio = new FeeDelegatedChainDataAnchoringWithRatioWrapper(this.klaytnCall)

        this.type = TX_TYPE_STRING
        this.tag = TX_TYPE_TAG

        this.utils = {
            accessList: AccessList,
            accessTuple: AccessTuple,
        }
    }

    /**
     * @type {object}
     */
    get klaytnCall() {
        return this._klaytnCall
    }

    set klaytnCall(c) {
        this._klaytnCall = c
    }

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
    async getTransactionByHash(transactionHash) {
        let txObject = await this.klaytnCall.getTransactionByHash(transactionHash)
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
                txObject = this.legacyTransaction.create(txObject, this.klaytnCall)
                break
            case 'TxTypeValueTransfer':
                txObject = this.valueTransfer.create(txObject, this.klaytnCall)
                break
            case 'TxTypeFeeDelegatedValueTransfer':
                txObject = this.feeDelegatedValueTransfer.create(txObject, this.klaytnCall)
                break
            case 'TxTypeFeeDelegatedValueTransferWithRatio':
                txObject = this.feeDelegatedValueTransferWithRatio.create(txObject, this.klaytnCall)
                break
            case 'TxTypeValueTransferMemo':
                txObject = this.valueTransferMemo.create(txObject, this.klaytnCall)
                break
            case 'TxTypeFeeDelegatedValueTransferMemo':
                txObject = this.feeDelegatedValueTransferMemo.create(txObject, this.klaytnCall)
                break
            case 'TxTypeFeeDelegatedValueTransferMemoWithRatio':
                txObject = this.feeDelegatedValueTransferMemoWithRatio.create(txObject, this.klaytnCall)
                break
            case 'TxTypeAccountUpdate':
                txObject = this.accountUpdate.create(txObject, this.klaytnCall)
                break
            case 'TxTypeFeeDelegatedAccountUpdate':
                txObject = this.feeDelegatedAccountUpdate.create(txObject, this.klaytnCall)
                break
            case 'TxTypeFeeDelegatedAccountUpdateWithRatio':
                txObject = this.feeDelegatedAccountUpdateWithRatio.create(txObject, this.klaytnCall)
                break
            case 'TxTypeSmartContractDeploy':
                txObject = this.smartContractDeploy.create(txObject, this.klaytnCall)
                break
            case 'TxTypeFeeDelegatedSmartContractDeploy':
                txObject = this.feeDelegatedSmartContractDeploy.create(txObject, this.klaytnCall)
                break
            case 'TxTypeFeeDelegatedSmartContractDeployWithRatio':
                txObject = this.feeDelegatedSmartContractDeployWithRatio.create(txObject, this.klaytnCall)
                break
            case 'TxTypeSmartContractExecution':
                txObject = this.smartContractExecution.create(txObject, this.klaytnCall)
                break
            case 'TxTypeFeeDelegatedSmartContractExecution':
                txObject = this.feeDelegatedSmartContractExecution.create(txObject, this.klaytnCall)
                break
            case 'TxTypeFeeDelegatedSmartContractExecutionWithRatio':
                txObject = this.feeDelegatedSmartContractExecutionWithRatio.create(txObject, this.klaytnCall)
                break
            case 'TxTypeCancel':
                txObject = this.cancel.create(txObject, this.klaytnCall)
                break
            case 'TxTypeFeeDelegatedCancel':
                txObject = this.feeDelegatedCancel.create(txObject, this.klaytnCall)
                break
            case 'TxTypeFeeDelegatedCancelWithRatio':
                txObject = this.feeDelegatedCancelWithRatio.create(txObject, this.klaytnCall)
                break
            case 'TxTypeChainDataAnchoring':
                txObject = this.chainDataAnchoring.create(txObject, this.klaytnCall)
                break
            case 'TxTypeFeeDelegatedChainDataAnchoring':
                txObject = this.feeDelegatedChainDataAnchoring.create(txObject, this.klaytnCall)
                break
            case 'TxTypeFeeDelegatedChainDataAnchoringWithRatio':
                txObject = this.feeDelegatedChainDataAnchoringWithRatio.create(txObject, this.klaytnCall)
                break
            case 'TxTypeEthereumAccessList':
                txObject = this.ethereumAccessList.create(txObject, this.klaytnCall)
                break
            case 'TxTypeEthereumDynamicFee':
                txObject = this.ethereumDynamicFee.create(txObject, this.klaytnCall)
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
    recoverPublicKeys(rawTx) {
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
    recoverFeePayerPublicKeys(rawTx) {
        const tx = TransactionDecoder.decode(rawTx)
        if (!(tx instanceof AbstractFeeDelegatedTransaction))
            throw new Error(
                'The `caver.transaction.recoverFeePayerPublicKeys` function can only use with fee delegation transaction. For basic transactions, use `caver.transaction.recoverPublicKeys`.'
            )
        return tx.recoverFeePayerPublicKeys()
    }

    /**
     * Decodes RLP-encoded transaction string and returns a Transaction instance.
     *
     * @example
     * const tx = caver.transaction.decode('0x{RLP-encoded transaction string}')
     *
     * @param {string} rlpEncoded - An RLP-encoded transaction string to decode.
     * @return {module:Transaction.Transaction}
     */
    decode(encoded) {
        return TransactionDecoder.decode(encoded)
    }
}

module.exports = TransactionModule
