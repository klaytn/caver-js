import { IValueTransfer } from './transactionTypes/valueTransfer/valueTransfer'
import { IFeeDelegatedValueTransfer } from './transactionTypes/valueTransfer/feeDelegatedValueTransfer'

export interface ITransaction {
    decode: TransactionDecoder.decode

    legacyTransaction: LegacyTransaction

    valueTransfer: IValueTransfer
    feeDelegatedValueTransfer: IFeeDelegatedValueTransfer
    feeDelegatedValueTransferWithRatio: FeeDelegatedValueTransferWithRatio

    valueTransferMemo: ValueTransferMemo
    feeDelegatedValueTransferMemo: FeeDelegatedValueTransferMemo
    feeDelegatedValueTransferMemoWithRatio: FeeDelegatedValueTransferMemoWithRatio

    accountUpdate: AccountUpdate
    feeDelegatedAccountUpdate: FeeDelegatedAccountUpdate
    feeDelegatedAccountUpdateWithRatio: FeeDelegatedAccountUpdateWithRatio

    smartContractDeploy: SmartContractDeploy
    feeDelegatedSmartContractDeploy: FeeDelegatedSmartContractDeploy
    feeDelegatedSmartContractDeployWithRatio: FeeDelegatedSmartContractDeployWithRatio

    smartContractExecution: SmartContractExecution
    feeDelegatedSmartContractExecution: FeeDelegatedSmartContractExecution
    feeDelegatedSmartContractExecutionWithRatio: FeeDelegatedSmartContractExecutionWithRatio

    cancel: Cancel
    feeDelegatedCancel: FeeDelegatedCancel
    feeDelegatedCancelWithRatio: FeeDelegatedCancelWithRatio

    chainDataAnchoring: ChainDataAnchoring
    feeDelegatedChainDataAnchoring: FeeDelegatedChainDataAnchoring
    feeDelegatedChainDataAnchoringWithRatio: FeeDelegatedChainDataAnchoringWithRatio

    type: TX_TYPE_STRING
    tag: TX_TYPE_TAG
}

export default {
    decode: TransactionDecoder.decode,

    legacyTransaction: LegacyTransaction,

    valueTransfer: IValueTransfer,
    feeDelegatedValueTransfer: IFeeDelegatedValueTransfer,
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
