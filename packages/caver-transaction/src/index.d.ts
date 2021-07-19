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

export default interface ITransaction {
    decode: typeof TransactionDecoder['decode']
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
    cancel: typeof Cancel,
    feeDelegatedCancel: typeof FeeDelegatedCancel
    feeDelegatedCancelWithRatio: typeof FeeDelegatedCancelWithRatio
    chainDataAnchoring: typeof ChainDataAnchoring
    feeDelegatedChainDataAnchoring: typeof FeeDelegatedChainDataAnchoring
    feeDelegatedChainDataAnchoringWithRatio: typeof FeeDelegatedChainDataAnchoringWithRatio

    type: {
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
    tag: {
        TxTypeLegacyTransaction: '',
        '': ITransaction['type']['TxTypeLegacyTransaction'],
        TxTypeValueTransfer: '0x08',
        '0x08': ITransaction['type']['TxTypeValueTransfer']
        TxTypeFeeDelegatedValueTransfer: '0x09',
        '0x09': ITransaction['type']['TxTypeFeeDelegatedValueTransfer']
        TxTypeFeeDelegatedValueTransferWithRatio: '0x0a',
        '0x0a': ITransaction['type']['TxTypeFeeDelegatedValueTransferWithRatio']
        TxTypeValueTransferMemo: '0x10',
        '0x10': ITransaction['type']['TxTypeValueTransferMemo']
        TxTypeFeeDelegatedValueTransferMemo: '0x11',
        '0x11': ITransaction['type']['TxTypeFeeDelegatedValueTransferMemo']
        TxTypeFeeDelegatedValueTransferMemoWithRatio: '0x12',
        '0x12': ITransaction['type']['TxTypeFeeDelegatedValueTransferMemoWithRatio']
        TxTypeAccountUpdate: '0x20',
        '0x20': ITransaction['type']['TxTypeAccountUpdate']
        TxTypeFeeDelegatedAccountUpdate: '0x21',
        '0x21': ITransaction['type']['TxTypeFeeDelegatedAccountUpdate']
        TxTypeFeeDelegatedAccountUpdateWithRatio: '0x22',
        '0x22': ITransaction['type']['TxTypeFeeDelegatedAccountUpdateWithRatio']
        TxTypeSmartContractDeploy: '0x28',
        '0x28': ITransaction['type']['TxTypeSmartContractDeploy']
        TxTypeFeeDelegatedSmartContractDeploy: '0x29',
        '0x29': ITransaction['type']['TxTypeFeeDelegatedSmartContractDeploy']
        TxTypeFeeDelegatedSmartContractDeployWithRatio: '0x2a',
        '0x2a': ITransaction['type']['TxTypeFeeDelegatedSmartContractDeployWithRatio']
        TxTypeSmartContractExecution: '0x30',
        '0x30': ITransaction['type']['TxTypeSmartContractExecution']
        TxTypeFeeDelegatedSmartContractExecution: '0x31',
        '0x31': ITransaction['type']['TxTypeFeeDelegatedSmartContractExecution']
        TxTypeFeeDelegatedSmartContractExecutionWithRatio: '0x32',
        '0x32': ITransaction['type']['TxTypeFeeDelegatedSmartContractExecutionWithRatio']
        TxTypeCancel: '0x38',
        '0x38': ITransaction['type']['TxTypeCancel']
        TxTypeFeeDelegatedCancel: '0x39',
        '0x39': ITransaction['type']['TxTypeFeeDelegatedCancel']
        TxTypeFeeDelegatedCancelWithRatio: '0x3a',
        '0x3a': ITransaction['type']['TxTypeFeeDelegatedCancelWithRatio']
        TxTypeChainDataAnchoring: '0x48',
        '0x48': ITransaction['type']['TxTypeChainDataAnchoring']
        TxTypeFeeDelegatedChainDataAnchoring: '0x49',
        '0x49': ITransaction['type']['TxTypeFeeDelegatedChainDataAnchoring']
        TxTypeFeeDelegatedChainDataAnchoringWithRatio: '0x4a',
        '0x4a': ITransaction['type']['TxTypeFeeDelegatedChainDataAnchoringWithRatio']
    }
}