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
const { TX_TYPE_STRING, TX_TYPE_TAG } = require('./transactionHelper/transactionHelper')

module.exports = {
    decode: TransactionDecoder.decode,

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
