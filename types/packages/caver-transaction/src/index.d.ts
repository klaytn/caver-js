/*
    Copyright 2021 The caver-js Authors
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

import TransactionDecoder from './transactionDecoder/transactionDecoder'
import AbstractTransaction from './transactionTypes/abstractTransaction'
import AccountUpdate from './transactionTypes/accountUpdate/accountUpdate'
import FeeDelegatedAccountUpdate from './transactionTypes/accountUpdate/feeDelegatedAccountUpdate'
import FeeDelegatedAccountUpdateWithRatio from './transactionTypes/accountUpdate/feeDelegatedAccountUpdateWithRatio'
import Cancel from './transactionTypes/cancel/cancel'
import FeeDelegatedCancel from './transactionTypes/cancel/feeDelegatedCancel'
import FeeDelegatedCancelWithRatio from './transactionTypes/cancel/feeDelegatedCancelWithRatio'
import ChainDataAnchoring from './transactionTypes/chainDataAnchoring/chainDataAnchoring'
import FeeDelegatedChainDataAnchoring from './transactionTypes/chainDataAnchoring/feeDelegatedChainDataAnchoring'
import FeeDelegatedChainDataAnchoringWithRatio from './transactionTypes/chainDataAnchoring/feeDelegatedChainDataAnchoringWithRatio'
import LegacyTransaction from './transactionTypes/legacyTransaction/legacyTransaction'
import FeeDelegatedSmartContractDeploy from './transactionTypes/smartContractDeploy/feeDelegatedSmartContractDeploy'
import FeeDelegatedSmartContractDeployWithRatio from './transactionTypes/smartContractDeploy/feeDelegatedSmartContractDeployWithRatio'
import SmartContractDeploy from './transactionTypes/smartContractDeploy/smartContractDeploy'
import FeeDelegatedSmartContractExecution from './transactionTypes/smartContractExecution/feeDelegatedSmartContractExecution'
import FeeDelegatedSmartContractExecutionWithRatio from './transactionTypes/smartContractExecution/feeDelegatedSmartContractExecutionWithRatio'
import SmartContractExecution from './transactionTypes/smartContractExecution/smartContractExecution'
import FeeDelegatedValueTransfer from './transactionTypes/valueTransfer/feeDelegatedValueTransfer'
import FeeDelegatedValueTransferWithRatio from './transactionTypes/valueTransfer/feeDelegatedValueTransferWithRatio'
import ValueTransfer from './transactionTypes/valueTransfer/valueTransfer'
import FeeDelegatedValueTransferMemo from './transactionTypes/valueTransferMemo/feeDelegatedValueTransferMemo'
import FeeDelegatedValueTransferMemoWithRatio from './transactionTypes/valueTransferMemo/feeDelegatedValueTransferMemoWithRatio'
import ValueTransferMemo from './transactionTypes/valueTransferMemo/valueTransferMemo'

export type Transaction =
    | LegacyTransaction
    | ValueTransfer
    | FeeDelegatedValueTransfer
    | FeeDelegatedValueTransferWithRatio
    | ValueTransferMemo
    | FeeDelegatedValueTransferMemo
    | FeeDelegatedValueTransferMemoWithRatio
    | AccountUpdate
    | FeeDelegatedAccountUpdate
    | FeeDelegatedAccountUpdateWithRatio
    | SmartContractDeploy
    | FeeDelegatedSmartContractDeploy
    | FeeDelegatedSmartContractDeployWithRatio
    | SmartContractExecution
    | FeeDelegatedSmartContractExecution
    | FeeDelegatedSmartContractExecutionWithRatio
    | Cancel
    | FeeDelegatedCancel
    | FeeDelegatedCancelWithRatio
    | ChainDataAnchoring
    | FeeDelegatedChainDataAnchoring
    | FeeDelegatedChainDataAnchoringWithRatio

export type FeeDelegatedTransaction =
    | FeeDelegatedValueTransfer
    | FeeDelegatedValueTransferWithRatio
    | FeeDelegatedValueTransferMemo
    | FeeDelegatedValueTransferMemoWithRatio
    | FeeDelegatedAccountUpdate
    | FeeDelegatedAccountUpdateWithRatio
    | FeeDelegatedSmartContractDeploy
    | FeeDelegatedSmartContractDeployWithRatio
    | FeeDelegatedSmartContractExecution
    | FeeDelegatedSmartContractExecutionWithRatio
    | FeeDelegatedCancel
    | FeeDelegatedCancelWithRatio
    | FeeDelegatedChainDataAnchoring
    | FeeDelegatedChainDataAnchoringWithRatio

export default interface TransactionModule {
    decode: TransactionDecoder['decode']
    getTransactionByHash(transactionHash: string): AbstractTransaction
    recoverPublicKeys(rawTx: string): string[]
    recoverFeePayerPublicKeys(rawTx: string): string[]
    legacyTransaction: typeof LegacyTransaction
    valueTransfer: typeof ValueTransfer
    feeDelegatedValueTransfer: typeof FeeDelegatedValueTransfer
    feeDelegatedValueTransferWithRatio: typeof FeeDelegatedValueTransferWithRatio
    valueTransferMemo: typeof ValueTransferMemo
    feeDelegatedValueTransferMemo: typeof FeeDelegatedValueTransferMemo
    feeDelegatedValueTransferMemoWithRatio: typeof FeeDelegatedValueTransferMemoWithRatio
    accountUpdate: typeof AccountUpdate
    feeDelegatedAccountUpdate: typeof FeeDelegatedAccountUpdate
    feeDelegatedAccountUpdateWithRatio: typeof FeeDelegatedAccountUpdateWithRatio
    smartContractDeploy: typeof SmartContractDeploy
    feeDelegatedSmartContractDeploy: typeof FeeDelegatedSmartContractDeploy
    feeDelegatedSmartContractDeployWithRatio: typeof FeeDelegatedSmartContractDeployWithRatio
    smartContractExecution: typeof SmartContractExecution
    feeDelegatedSmartContractExecution: typeof FeeDelegatedSmartContractExecution
    feeDelegatedSmartContractExecutionWithRatio: typeof FeeDelegatedSmartContractExecutionWithRatio
    cancel: typeof Cancel
    feeDelegatedCancel: typeof FeeDelegatedCancel
    feeDelegatedCancelWithRatio: typeof FeeDelegatedCancelWithRatio
    chainDataAnchoring: typeof ChainDataAnchoring
    feeDelegatedChainDataAnchoring: typeof FeeDelegatedChainDataAnchoring
    feeDelegatedChainDataAnchoringWithRatio: typeof FeeDelegatedChainDataAnchoringWithRatio

    type: { [key: string]: string }
    tag: { [key: string]: string }
}
