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

const { TX_TYPE_STRING, typeDetectionFromRLPEncoding } = require('../transactionHelper/transactionHelper')
const LegacyTransaction = require('../transactionTypes/legacyTransaction/legacyTransaction')
const ValueTransfer = require('../transactionTypes/valueTransfer/valueTransfer')
const FeeDelegatedValueTransfer = require('../transactionTypes/valueTransfer/feeDelegatedValueTransfer')
const FeeDelegatedValueTransferWithRatio = require('../transactionTypes/valueTransfer/feeDelegatedValueTransferWithRatio')
const ValueTransferMemo = require('../transactionTypes/valueTransferMemo/valueTransferMemo')
const FeeDelegatedValueTransferMemo = require('../transactionTypes/valueTransferMemo/feeDelegatedValueTransferMemo')
const FeeDelegatedValueTransferMemoWithRatio = require('../transactionTypes/valueTransferMemo/feeDelegatedValueTransferMemoWithRatio')
const AccountUpdate = require('../transactionTypes/accountUpdate/accountUpdate')
const FeeDelegatedAccountUpdate = require('../transactionTypes/accountUpdate/feeDelegatedAccountUpdate')
const FeeDelegatedAccountUpdateWithRatio = require('../transactionTypes/accountUpdate/feeDelegatedAccountUpdateWithRatio')
const SmartContractDeploy = require('../transactionTypes/smartContractDeploy/smartContractDeploy')
const FeeDelegatedSmartContractDeploy = require('../transactionTypes/smartContractDeploy/feeDelegatedSmartContractDeploy')
const FeeDelegatedSmartContractDeployWithRatio = require('../transactionTypes/smartContractDeploy/feeDelegatedSmartContractDeployWithRatio')
const SmartContractExecution = require('../transactionTypes/smartContractExecution/smartContractExecution')
const FeeDelegatedSmartContractExecution = require('../transactionTypes/smartContractExecution/feeDelegatedSmartContractExecution')
const FeeDelegatedSmartContractExecutionWithRatio = require('../transactionTypes/smartContractExecution/feeDelegatedSmartContractExecutionWithRatio')
const Cancel = require('../transactionTypes/cancel/cancel')
const FeeDelegatedCancel = require('../transactionTypes/cancel/feeDelegatedCancel')
const FeeDelegatedCancelWithRatio = require('../transactionTypes/cancel/feeDelegatedCancelWithRatio')
const ChainDataAnchoring = require('../transactionTypes/chainDataAnchoring/chainDataAnchoring')
const FeeDelegatedChainDataAnchoring = require('../transactionTypes/chainDataAnchoring/feeDelegatedChainDataAnchoring')
const FeeDelegatedChainDataAnchoringWithRatio = require('../transactionTypes/chainDataAnchoring/feeDelegatedChainDataAnchoringWithRatio')

/**
 * Representing a transaction decoder.
 * @class
 */
class TransactionDecoder {
    /**
     * Decodes RLP-encoded transaction string and returns a Transaction instance.
     * @param {string} rlpEncoded - An RLP-encoded transaction string to decode.
     * @return {Transaction}
     */
    static decode(rlpEncoded) {
        const type = typeDetectionFromRLPEncoding(rlpEncoded)

        switch (type) {
            case TX_TYPE_STRING.TxTypeLegacyTransaction:
                return LegacyTransaction.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeValueTransfer:
                return ValueTransfer.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeFeeDelegatedValueTransfer:
                return FeeDelegatedValueTransfer.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeFeeDelegatedValueTransferWithRatio:
                return FeeDelegatedValueTransferWithRatio.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeValueTransferMemo:
                return ValueTransferMemo.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeFeeDelegatedValueTransferMemo:
                return FeeDelegatedValueTransferMemo.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeFeeDelegatedValueTransferMemoWithRatio:
                return FeeDelegatedValueTransferMemoWithRatio.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeAccountUpdate:
                return AccountUpdate.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeFeeDelegatedAccountUpdate:
                return FeeDelegatedAccountUpdate.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeFeeDelegatedAccountUpdateWithRatio:
                return FeeDelegatedAccountUpdateWithRatio.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeSmartContractDeploy:
                return SmartContractDeploy.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy:
                return FeeDelegatedSmartContractDeploy.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio:
                return FeeDelegatedSmartContractDeployWithRatio.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeSmartContractExecution:
                return SmartContractExecution.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution:
                return FeeDelegatedSmartContractExecution.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio:
                return FeeDelegatedSmartContractExecutionWithRatio.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeCancel:
                return Cancel.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeFeeDelegatedCancel:
                return FeeDelegatedCancel.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeFeeDelegatedCancelWithRatio:
                return FeeDelegatedCancelWithRatio.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeChainDataAnchoring:
                return ChainDataAnchoring.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeFeeDelegatedChainDataAnchoring:
                return FeeDelegatedChainDataAnchoring.decode(rlpEncoded)
            case TX_TYPE_STRING.TxTypeFeeDelegatedChainDataAnchoringWithRatio:
                return FeeDelegatedChainDataAnchoringWithRatio.decode(rlpEncoded)
        }
    }
}

module.exports = TransactionDecoder
