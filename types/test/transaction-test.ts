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

import Caver, {
    LegacyTransaction,
    ValueTransfer,
    FeeDelegatedValueTransfer,
    FeeDelegatedValueTransferWithRatio,
    ValueTransferMemo,
    FeeDelegatedValueTransferMemo,
    FeeDelegatedValueTransferMemoWithRatio,
    AccountUpdate,
    FeeDelegatedAccountUpdate,
    FeeDelegatedAccountUpdateWithRatio,
    SmartContractDeploy,
    FeeDelegatedSmartContractDeploy,
    FeeDelegatedSmartContractDeployWithRatio,
    SmartContractExecution,
    FeeDelegatedSmartContractExecution,
    FeeDelegatedSmartContractExecutionWithRatio,
    Cancel,
    FeeDelegatedCancel,
    FeeDelegatedCancelWithRatio,
    ChainDataAnchoring,
    FeeDelegatedChainDataAnchoring,
    FeeDelegatedChainDataAnchoringWithRatio,
    SingleKeyring,
    MultipleKeyring,
    RoleBasedKeyring,
    SignatureData,
    AbstractTransaction,
    AbstractFeeDelegatedTransaction,
    AbstractFeeDelegatedWithRatioTransaction,
} from 'caver-js'

const caver = new Caver()

// $ExpectType TransactionModule
caver.transaction

// $ExpectType Transaction
caver.transaction.decode('string')

// $ExpectType Promise<AbstractTransaction>
caver.transaction.getTransactionByHash('hash')

// $ExpectType string[]
caver.transaction.recoverPublicKeys('rawTx')

// $ExpectType string[]
caver.transaction.recoverFeePayerPublicKeys('rawTx')

// $ExpectType typeof LegacyTransaction
caver.transaction.legacyTransaction
// $ExpectType typeof ValueTransfer
caver.transaction.valueTransfer
// $ExpectType typeof ValueTransferMemo
caver.transaction.valueTransferMemo
// $ExpectType typeof AccountUpdate
caver.transaction.accountUpdate
// $ExpectType typeof SmartContractDeploy
caver.transaction.smartContractDeploy
// $ExpectType typeof SmartContractExecution
caver.transaction.smartContractExecution
// $ExpectType typeof Cancel
caver.transaction.cancel
// $ExpectType typeof ChainDataAnchoring
caver.transaction.chainDataAnchoring
// $ExpectType typeof FeeDelegatedValueTransfer
caver.transaction.feeDelegatedValueTransfer
// $ExpectType typeof FeeDelegatedValueTransferMemo
caver.transaction.feeDelegatedValueTransferMemo
// $ExpectType typeof FeeDelegatedAccountUpdate
caver.transaction.feeDelegatedAccountUpdate
// $ExpectType typeof FeeDelegatedSmartContractDeploy
caver.transaction.feeDelegatedSmartContractDeploy
// $ExpectType typeof FeeDelegatedSmartContractExecution
caver.transaction.feeDelegatedSmartContractExecution
// $ExpectType typeof FeeDelegatedCancel
caver.transaction.feeDelegatedCancel
// $ExpectType typeof FeeDelegatedChainDataAnchoring
caver.transaction.feeDelegatedChainDataAnchoring
// $ExpectType typeof FeeDelegatedValueTransferWithRatio
caver.transaction.feeDelegatedValueTransferWithRatio
// $ExpectType typeof FeeDelegatedValueTransferMemoWithRatio
caver.transaction.feeDelegatedValueTransferMemoWithRatio
// $ExpectType typeof FeeDelegatedAccountUpdateWithRatio
caver.transaction.feeDelegatedAccountUpdateWithRatio
// $ExpectType typeof FeeDelegatedSmartContractDeployWithRatio
caver.transaction.feeDelegatedSmartContractDeployWithRatio
// $ExpectType typeof FeeDelegatedSmartContractExecutionWithRatio
caver.transaction.feeDelegatedSmartContractExecutionWithRatio
// $ExpectType typeof FeeDelegatedCancelWithRatio
caver.transaction.feeDelegatedCancelWithRatio
// $ExpectType typeof FeeDelegatedChainDataAnchoringWithRatio
caver.transaction.feeDelegatedChainDataAnchoringWithRatio

// $ExpectType string
caver.transaction.type.valueTransfer
// $ExpectType string
caver.transaction.type['valueTransfer']

// $ExpectType string
caver.transaction.tag.valueTransfer
// $ExpectType string
caver.transaction.tag['valueTransfer']

// $ExpectType LegacyTransaction
new LegacyTransaction({})
// $ExpectType LegacyTransaction
LegacyTransaction.create({})
// $ExpectType LegacyTransaction
LegacyTransaction.decode('string')

// $ExpectType ValueTransfer
new ValueTransfer({})
// $ExpectType ValueTransfer
ValueTransfer.create({})
// $ExpectType ValueTransfer
ValueTransfer.create('string')
// $ExpectType ValueTransfer
ValueTransfer.decode('string')

// $ExpectType FeeDelegatedValueTransfer
new FeeDelegatedValueTransfer({})
// $ExpectType FeeDelegatedValueTransfer
FeeDelegatedValueTransfer.create({})
// $ExpectType FeeDelegatedValueTransfer
FeeDelegatedValueTransfer.create('string')
// $ExpectType FeeDelegatedValueTransfer
FeeDelegatedValueTransfer.decode('string')

// $ExpectType FeeDelegatedValueTransferWithRatio
new FeeDelegatedValueTransferWithRatio({})
// $ExpectType FeeDelegatedValueTransferWithRatio
FeeDelegatedValueTransferWithRatio.create({})
// $ExpectType FeeDelegatedValueTransferWithRatio
FeeDelegatedValueTransferWithRatio.create('string')
// $ExpectType FeeDelegatedValueTransferWithRatio
FeeDelegatedValueTransferWithRatio.decode('string')

// $ExpectType ValueTransferMemo
new ValueTransferMemo({})
// $ExpectType ValueTransferMemo
ValueTransferMemo.create({})
// $ExpectType ValueTransferMemo
ValueTransferMemo.create('string')
// $ExpectType ValueTransferMemo
ValueTransferMemo.decode('string')

// $ExpectType FeeDelegatedValueTransferMemo
new FeeDelegatedValueTransferMemo({})
// $ExpectType FeeDelegatedValueTransferMemo
FeeDelegatedValueTransferMemo.create({})
// $ExpectType FeeDelegatedValueTransferMemo
FeeDelegatedValueTransferMemo.create('string')
// $ExpectType FeeDelegatedValueTransferMemo
FeeDelegatedValueTransferMemo.decode('string')

// $ExpectType FeeDelegatedValueTransferMemoWithRatio
new FeeDelegatedValueTransferMemoWithRatio({})
// $ExpectType FeeDelegatedValueTransferMemoWithRatio
FeeDelegatedValueTransferMemoWithRatio.create({})
// $ExpectType FeeDelegatedValueTransferMemoWithRatio
FeeDelegatedValueTransferMemoWithRatio.create('string')
// $ExpectType FeeDelegatedValueTransferMemoWithRatio
FeeDelegatedValueTransferMemoWithRatio.decode('string')

// $ExpectType AccountUpdate
new AccountUpdate({})
// $ExpectType AccountUpdate
AccountUpdate.create({})
// $ExpectType AccountUpdate
AccountUpdate.create('string')
// $ExpectType AccountUpdate
AccountUpdate.decode('string')

// $ExpectType FeeDelegatedAccountUpdate
new FeeDelegatedAccountUpdate({})
// $ExpectType FeeDelegatedAccountUpdate
FeeDelegatedAccountUpdate.create({})
// $ExpectType FeeDelegatedAccountUpdate
FeeDelegatedAccountUpdate.create('string')
// $ExpectType FeeDelegatedAccountUpdate
FeeDelegatedAccountUpdate.decode('string')

// $ExpectType FeeDelegatedAccountUpdateWithRatio
new FeeDelegatedAccountUpdateWithRatio({})
// $ExpectType FeeDelegatedAccountUpdateWithRatio
FeeDelegatedAccountUpdateWithRatio.create({})
// $ExpectType FeeDelegatedAccountUpdateWithRatio
FeeDelegatedAccountUpdateWithRatio.create('string')
// $ExpectType FeeDelegatedAccountUpdateWithRatio
FeeDelegatedAccountUpdateWithRatio.decode('string')

// $ExpectType SmartContractDeploy
new SmartContractDeploy({})
// $ExpectType SmartContractDeploy
SmartContractDeploy.create({})
// $ExpectType SmartContractDeploy
SmartContractDeploy.create('string')
// $ExpectType SmartContractDeploy
SmartContractDeploy.decode('string')

// $ExpectType FeeDelegatedSmartContractDeploy
new FeeDelegatedSmartContractDeploy({})
// $ExpectType FeeDelegatedSmartContractDeploy
FeeDelegatedSmartContractDeploy.create({})
// $ExpectType FeeDelegatedSmartContractDeploy
FeeDelegatedSmartContractDeploy.create('string')
// $ExpectType FeeDelegatedSmartContractDeploy
FeeDelegatedSmartContractDeploy.decode('string')

// $ExpectType FeeDelegatedSmartContractDeployWithRatio
new FeeDelegatedSmartContractDeployWithRatio({})
// $ExpectType FeeDelegatedSmartContractDeployWithRatio
FeeDelegatedSmartContractDeployWithRatio.create({})
// $ExpectType FeeDelegatedSmartContractDeployWithRatio
FeeDelegatedSmartContractDeployWithRatio.create('string')
// $ExpectType FeeDelegatedSmartContractDeployWithRatio
FeeDelegatedSmartContractDeployWithRatio.decode('string')

// $ExpectType SmartContractExecution
new SmartContractExecution({})
// $ExpectType SmartContractExecution
SmartContractExecution.create({})
// $ExpectType SmartContractExecution
SmartContractExecution.create('string')
// $ExpectType SmartContractExecution
SmartContractExecution.decode('string')

// $ExpectType FeeDelegatedSmartContractExecution
new FeeDelegatedSmartContractExecution({})
// $ExpectType FeeDelegatedSmartContractExecution
FeeDelegatedSmartContractExecution.create({})
// $ExpectType FeeDelegatedSmartContractExecution
FeeDelegatedSmartContractExecution.create('string')
// $ExpectType FeeDelegatedSmartContractExecution
FeeDelegatedSmartContractExecution.decode('string')

// $ExpectType FeeDelegatedSmartContractExecutionWithRatio
new FeeDelegatedSmartContractExecutionWithRatio({})
// $ExpectType FeeDelegatedSmartContractExecutionWithRatio
FeeDelegatedSmartContractExecutionWithRatio.create({})
// $ExpectType FeeDelegatedSmartContractExecutionWithRatio
FeeDelegatedSmartContractExecutionWithRatio.create('string')
// $ExpectType FeeDelegatedSmartContractExecutionWithRatio
FeeDelegatedSmartContractExecutionWithRatio.decode('string')

// $ExpectType Cancel
new Cancel({})
// $ExpectType Cancel
Cancel.create({})
// $ExpectType Cancel
Cancel.create('string')
// $ExpectType Cancel
Cancel.decode('string')

// $ExpectType FeeDelegatedCancel
new FeeDelegatedCancel({})
// $ExpectType FeeDelegatedCancel
FeeDelegatedCancel.create({})
// $ExpectType FeeDelegatedCancel
FeeDelegatedCancel.create('string')
// $ExpectType FeeDelegatedCancel
FeeDelegatedCancel.decode('string')

// $ExpectType FeeDelegatedCancelWithRatio
new FeeDelegatedCancelWithRatio({})
// $ExpectType FeeDelegatedCancelWithRatio
FeeDelegatedCancelWithRatio.create({})
// $ExpectType FeeDelegatedCancelWithRatio
FeeDelegatedCancelWithRatio.create('string')
// $ExpectType FeeDelegatedCancelWithRatio
FeeDelegatedCancelWithRatio.decode('string')

// $ExpectType ChainDataAnchoring
new ChainDataAnchoring({})
// $ExpectType ChainDataAnchoring
ChainDataAnchoring.create({})
// $ExpectType ChainDataAnchoring
ChainDataAnchoring.create('string')
// $ExpectType ChainDataAnchoring
ChainDataAnchoring.decode('string')

// $ExpectType FeeDelegatedChainDataAnchoring
new FeeDelegatedChainDataAnchoring({})
// $ExpectType FeeDelegatedChainDataAnchoring
FeeDelegatedChainDataAnchoring.create({})
// $ExpectType FeeDelegatedChainDataAnchoring
FeeDelegatedChainDataAnchoring.create('string')
// $ExpectType FeeDelegatedChainDataAnchoring
FeeDelegatedChainDataAnchoring.decode('string')

// $ExpectType FeeDelegatedChainDataAnchoringWithRatio
new FeeDelegatedChainDataAnchoringWithRatio({})
// $ExpectType FeeDelegatedChainDataAnchoringWithRatio
FeeDelegatedChainDataAnchoringWithRatio.create({})
// $ExpectType FeeDelegatedChainDataAnchoringWithRatio
FeeDelegatedChainDataAnchoringWithRatio.create('string')
// $ExpectType FeeDelegatedChainDataAnchoringWithRatio
FeeDelegatedChainDataAnchoringWithRatio.decode('string')

const address = '0xde39030c0b51c01a83fc819fb79d47c90d6a3a60'
const prvKeys = [
    '0x99305a113c6182985e1ee6ec636ee5e8d0b93fcf3af7f72f8177938afca688f1',
    '0x97f2c7da1471122b0d0aa54d1ec6b0cc171c81d97e13d27c204d838f76c98310',
]
const keyrings = {
    single: new SingleKeyring(address, prvKeys[0]),
    multiple: new MultipleKeyring(address, prvKeys),
    roleBased: new RoleBasedKeyring(address, [prvKeys, prvKeys, prvKeys]),
}
const sig = new SignatureData(['0x01', '0x', '0x'])

const legacyTransaction = new LegacyTransaction({})

// $ExpectType string
legacyTransaction.getRLPEncoding()

// $ExpectType string
legacyTransaction.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
legacyTransaction.sign('string')
// $ExpectType Promise<AbstractTransaction>
legacyTransaction.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
legacyTransaction.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
legacyTransaction.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
legacyTransaction.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
legacyTransaction.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
legacyTransaction.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
legacyTransaction.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
legacyTransaction.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
legacyTransaction.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
legacyTransaction.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
legacyTransaction.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
legacyTransaction.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
legacyTransaction.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
legacyTransaction.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
legacyTransaction.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType void
legacyTransaction.appendSignatures(sig)
// $ExpectType void
legacyTransaction.appendSignatures([sig, sig])
// $ExpectType void
legacyTransaction.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
legacyTransaction.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
legacyTransaction.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
legacyTransaction.getRawTransaction()

// $ExpectType string
legacyTransaction.getTransactionHash()

// $ExpectType string
legacyTransaction.getSenderTxHash()

// $ExpectType string
legacyTransaction.getRLPEncodingForSignature()

// $ExpectType string[]
legacyTransaction.recoverPublicKeys()

// $ExpectType Promise<void>
legacyTransaction.fillTransaction()

// $ExpectType void
legacyTransaction.validateOptionalValues()

// $ExpectType string
legacyTransaction.type
// $ExpectType string
legacyTransaction.from
// $ExpectType string
legacyTransaction.nonce
// $ExpectType string
legacyTransaction.gas
// $ExpectType string
legacyTransaction.gasPrice
// $ExpectType string
legacyTransaction.chainId
// $ExpectType SignatureData[]
legacyTransaction.signatures
// $ExpectType string
legacyTransaction.to
// $ExpectType string
legacyTransaction.value
// $ExpectType string
legacyTransaction.input
// $ExpectType string
legacyTransaction.data

const valueTransfer = new ValueTransfer({})

// $ExpectType string
valueTransfer.getRLPEncoding()

// $ExpectType string
valueTransfer.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
valueTransfer.sign('string')
// $ExpectType Promise<AbstractTransaction>
valueTransfer.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
valueTransfer.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
valueTransfer.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
valueTransfer.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
valueTransfer.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
valueTransfer.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
valueTransfer.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
valueTransfer.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
valueTransfer.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
valueTransfer.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
valueTransfer.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
valueTransfer.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
valueTransfer.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
valueTransfer.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
valueTransfer.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType void
valueTransfer.appendSignatures(sig)
// $ExpectType void
valueTransfer.appendSignatures([sig, sig])
// $ExpectType void
valueTransfer.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
valueTransfer.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
valueTransfer.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
valueTransfer.getRawTransaction()

// $ExpectType string
valueTransfer.getTransactionHash()

// $ExpectType string
valueTransfer.getSenderTxHash()

// $ExpectType string
valueTransfer.getRLPEncodingForSignature()

// $ExpectType string[]
valueTransfer.recoverPublicKeys()

// $ExpectType Promise<void>
valueTransfer.fillTransaction()

// $ExpectType void
valueTransfer.validateOptionalValues()

// $ExpectType string
valueTransfer.type
// $ExpectType string
valueTransfer.from
// $ExpectType string
valueTransfer.nonce
// $ExpectType string
valueTransfer.gas
// $ExpectType string
valueTransfer.gasPrice
// $ExpectType string
valueTransfer.chainId
// $ExpectType SignatureData[]
valueTransfer.signatures
// $ExpectType string
valueTransfer.to
// $ExpectType string
valueTransfer.value

const valueTransferMemo = new ValueTransferMemo({})

// $ExpectType string
valueTransferMemo.getRLPEncoding()

// $ExpectType string
valueTransferMemo.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
valueTransferMemo.sign('string')
// $ExpectType Promise<AbstractTransaction>
valueTransferMemo.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
valueTransferMemo.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
valueTransferMemo.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
valueTransferMemo.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
valueTransferMemo.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
valueTransferMemo.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
valueTransferMemo.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
valueTransferMemo.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
valueTransferMemo.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
valueTransferMemo.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
valueTransferMemo.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
valueTransferMemo.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
valueTransferMemo.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
valueTransferMemo.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
valueTransferMemo.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType void
valueTransferMemo.appendSignatures(sig)
// $ExpectType void
valueTransferMemo.appendSignatures([sig, sig])
// $ExpectType void
valueTransferMemo.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
valueTransferMemo.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
valueTransferMemo.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
valueTransferMemo.getRawTransaction()

// $ExpectType string
valueTransferMemo.getTransactionHash()

// $ExpectType string
valueTransferMemo.getSenderTxHash()

// $ExpectType string
valueTransferMemo.getRLPEncodingForSignature()

// $ExpectType string[]
valueTransferMemo.recoverPublicKeys()

// $ExpectType Promise<void>
valueTransferMemo.fillTransaction()

// $ExpectType void
valueTransferMemo.validateOptionalValues()

// $ExpectType string
valueTransferMemo.type
// $ExpectType string
valueTransferMemo.from
// $ExpectType string
valueTransferMemo.nonce
// $ExpectType string
valueTransferMemo.gas
// $ExpectType string
valueTransferMemo.gasPrice
// $ExpectType string
valueTransferMemo.chainId
// $ExpectType SignatureData[]
valueTransferMemo.signatures
// $ExpectType string
valueTransferMemo.to
// $ExpectType string
valueTransferMemo.value
// $ExpectType string
valueTransferMemo.input
// $ExpectType string
valueTransferMemo.data

const accountUpdate = new AccountUpdate({})

// $ExpectType string
accountUpdate.getRLPEncoding()

// $ExpectType string
accountUpdate.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
accountUpdate.sign('string')
// $ExpectType Promise<AbstractTransaction>
accountUpdate.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
accountUpdate.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
accountUpdate.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
accountUpdate.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
accountUpdate.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
accountUpdate.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
accountUpdate.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
accountUpdate.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
accountUpdate.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
accountUpdate.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
accountUpdate.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
accountUpdate.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
accountUpdate.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
accountUpdate.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
accountUpdate.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType void
accountUpdate.appendSignatures(sig)
// $ExpectType void
accountUpdate.appendSignatures([sig, sig])
// $ExpectType void
accountUpdate.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
accountUpdate.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
accountUpdate.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
accountUpdate.getRawTransaction()

// $ExpectType string
accountUpdate.getTransactionHash()

// $ExpectType string
accountUpdate.getSenderTxHash()

// $ExpectType string
accountUpdate.getRLPEncodingForSignature()

// $ExpectType string[]
accountUpdate.recoverPublicKeys()

// $ExpectType Promise<void>
accountUpdate.fillTransaction()

// $ExpectType void
accountUpdate.validateOptionalValues()

// $ExpectType string
accountUpdate.type
// $ExpectType string
accountUpdate.from
// $ExpectType string
accountUpdate.nonce
// $ExpectType string
accountUpdate.gas
// $ExpectType string
accountUpdate.gasPrice
// $ExpectType string
accountUpdate.chainId
// $ExpectType SignatureData[]
accountUpdate.signatures
// $ExpectType Account
accountUpdate.account

const smartContractDeploy = new SmartContractDeploy({})

// $ExpectType string
smartContractDeploy.getRLPEncoding()

// $ExpectType string
smartContractDeploy.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
smartContractDeploy.sign('string')
// $ExpectType Promise<AbstractTransaction>
smartContractDeploy.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
smartContractDeploy.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
smartContractDeploy.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
smartContractDeploy.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
smartContractDeploy.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
smartContractDeploy.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
smartContractDeploy.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
smartContractDeploy.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
smartContractDeploy.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
smartContractDeploy.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
smartContractDeploy.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
smartContractDeploy.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
smartContractDeploy.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
smartContractDeploy.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
smartContractDeploy.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType void
smartContractDeploy.appendSignatures(sig)
// $ExpectType void
smartContractDeploy.appendSignatures([sig, sig])
// $ExpectType void
smartContractDeploy.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
smartContractDeploy.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
smartContractDeploy.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
smartContractDeploy.getRawTransaction()

// $ExpectType string
smartContractDeploy.getTransactionHash()

// $ExpectType string
smartContractDeploy.getSenderTxHash()

// $ExpectType string
smartContractDeploy.getRLPEncodingForSignature()

// $ExpectType string[]
smartContractDeploy.recoverPublicKeys()

// $ExpectType Promise<void>
smartContractDeploy.fillTransaction()

// $ExpectType void
smartContractDeploy.validateOptionalValues()

// $ExpectType string
smartContractDeploy.type
// $ExpectType string
smartContractDeploy.from
// $ExpectType string
smartContractDeploy.nonce
// $ExpectType string
smartContractDeploy.gas
// $ExpectType string
smartContractDeploy.gasPrice
// $ExpectType string
smartContractDeploy.chainId
// $ExpectType SignatureData[]
smartContractDeploy.signatures
// $ExpectType string
smartContractDeploy.to
// $ExpectType string
smartContractDeploy.value
// $ExpectType string
smartContractDeploy.input
// $ExpectType string
smartContractDeploy.data
// $ExpectType boolean
smartContractDeploy.humanReadable
// $ExpectType string
smartContractDeploy.codeFormat

const smartContractExecution = new SmartContractExecution({})

// $ExpectType string
smartContractExecution.getRLPEncoding()

// $ExpectType string
smartContractExecution.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
smartContractExecution.sign('string')
// $ExpectType Promise<AbstractTransaction>
smartContractExecution.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
smartContractExecution.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
smartContractExecution.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
smartContractExecution.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
smartContractExecution.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
smartContractExecution.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
smartContractExecution.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
smartContractExecution.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
smartContractExecution.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
smartContractExecution.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
smartContractExecution.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
smartContractExecution.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
smartContractExecution.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
smartContractExecution.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
smartContractExecution.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType void
smartContractExecution.appendSignatures(sig)
// $ExpectType void
smartContractExecution.appendSignatures([sig, sig])
// $ExpectType void
smartContractExecution.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
smartContractExecution.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
smartContractExecution.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
smartContractExecution.getRawTransaction()

// $ExpectType string
smartContractExecution.getTransactionHash()

// $ExpectType string
smartContractExecution.getSenderTxHash()

// $ExpectType string
smartContractExecution.getRLPEncodingForSignature()

// $ExpectType string[]
smartContractExecution.recoverPublicKeys()

// $ExpectType Promise<void>
smartContractExecution.fillTransaction()

// $ExpectType void
smartContractExecution.validateOptionalValues()

// $ExpectType string
smartContractExecution.type
// $ExpectType string
smartContractExecution.from
// $ExpectType string
smartContractExecution.nonce
// $ExpectType string
smartContractExecution.gas
// $ExpectType string
smartContractExecution.gasPrice
// $ExpectType string
smartContractExecution.chainId
// $ExpectType SignatureData[]
smartContractExecution.signatures
// $ExpectType string
smartContractExecution.to
// $ExpectType string
smartContractExecution.value
// $ExpectType string
smartContractExecution.input
// $ExpectType string
smartContractExecution.data

const cancel = new Cancel({})

// $ExpectType string
cancel.getRLPEncoding()

// $ExpectType string
cancel.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
cancel.sign('string')
// $ExpectType Promise<AbstractTransaction>
cancel.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
cancel.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
cancel.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
cancel.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
cancel.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
cancel.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
cancel.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
cancel.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
cancel.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
cancel.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
cancel.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
cancel.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
cancel.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
cancel.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
cancel.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType void
cancel.appendSignatures(sig)
// $ExpectType void
cancel.appendSignatures([sig, sig])
// $ExpectType void
cancel.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
cancel.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
cancel.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
cancel.getRawTransaction()

// $ExpectType string
cancel.getTransactionHash()

// $ExpectType string
cancel.getSenderTxHash()

// $ExpectType string
cancel.getRLPEncodingForSignature()

// $ExpectType string[]
cancel.recoverPublicKeys()

// $ExpectType Promise<void>
cancel.fillTransaction()

// $ExpectType void
cancel.validateOptionalValues()

// $ExpectType string
cancel.type
// $ExpectType string
cancel.from
// $ExpectType string
cancel.nonce
// $ExpectType string
cancel.gas
// $ExpectType string
cancel.gasPrice
// $ExpectType string
cancel.chainId
// $ExpectType SignatureData[]
cancel.signatures

const chainDataAnchoring = new ChainDataAnchoring({})

// $ExpectType string
chainDataAnchoring.getRLPEncoding()

// $ExpectType string
chainDataAnchoring.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
chainDataAnchoring.sign('string')
// $ExpectType Promise<AbstractTransaction>
chainDataAnchoring.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
chainDataAnchoring.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
chainDataAnchoring.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
chainDataAnchoring.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
chainDataAnchoring.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
chainDataAnchoring.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
chainDataAnchoring.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
chainDataAnchoring.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
chainDataAnchoring.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
chainDataAnchoring.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
chainDataAnchoring.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
chainDataAnchoring.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
chainDataAnchoring.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
chainDataAnchoring.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
chainDataAnchoring.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType void
chainDataAnchoring.appendSignatures(sig)
// $ExpectType void
chainDataAnchoring.appendSignatures([sig, sig])
// $ExpectType void
chainDataAnchoring.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
chainDataAnchoring.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
chainDataAnchoring.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
chainDataAnchoring.getRawTransaction()

// $ExpectType string
chainDataAnchoring.getTransactionHash()

// $ExpectType string
chainDataAnchoring.getSenderTxHash()

// $ExpectType string
chainDataAnchoring.getRLPEncodingForSignature()

// $ExpectType string[]
chainDataAnchoring.recoverPublicKeys()

// $ExpectType Promise<void>
chainDataAnchoring.fillTransaction()

// $ExpectType void
chainDataAnchoring.validateOptionalValues()

// $ExpectType string
chainDataAnchoring.type
// $ExpectType string
chainDataAnchoring.from
// $ExpectType string
chainDataAnchoring.nonce
// $ExpectType string
chainDataAnchoring.gas
// $ExpectType string
chainDataAnchoring.gasPrice
// $ExpectType string
chainDataAnchoring.chainId
// $ExpectType SignatureData[]
chainDataAnchoring.signatures
// $ExpectType string
chainDataAnchoring.input

const feeDelegatedValueTransfer = new FeeDelegatedValueTransfer({})

// $ExpectType string
feeDelegatedValueTransfer.getRLPEncoding()

// $ExpectType string
feeDelegatedValueTransfer.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransfer.sign('string')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransfer.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransfer.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransfer.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransfer.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransfer.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransfer.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransfer.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransfer.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransfer.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransfer.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransfer.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransfer.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransfer.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransfer.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransfer.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransfer.signAsFeePayer('string')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransfer.signAsFeePayer(keyrings.single)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransfer.signAsFeePayer(keyrings.multiple)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransfer.signAsFeePayer(keyrings.roleBased)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransfer.signAsFeePayer('string', 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransfer.signAsFeePayer(keyrings.single, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransfer.signAsFeePayer(keyrings.multiple, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransfer.signAsFeePayer(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransfer.signAsFeePayer('string', (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransfer.signAsFeePayer(keyrings.single, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransfer.signAsFeePayer(keyrings.multiple, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransfer.signAsFeePayer(keyrings.roleBased, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransfer.signAsFeePayer('string', 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransfer.signAsFeePayer(keyrings.single, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransfer.signAsFeePayer(keyrings.multiple, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransfer.signAsFeePayer(keyrings.roleBased, 0, (tx: AbstractFeeDelegatedTransaction) => '')

// $ExpectType void
feeDelegatedValueTransfer.appendSignatures(sig)
// $ExpectType void
feeDelegatedValueTransfer.appendSignatures([sig, sig])
// $ExpectType void
feeDelegatedValueTransfer.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedValueTransfer.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType void
feeDelegatedValueTransfer.appendFeePayerSignatures(sig)
// $ExpectType void
feeDelegatedValueTransfer.appendFeePayerSignatures([sig, sig])
// $ExpectType void
feeDelegatedValueTransfer.appendFeePayerSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedValueTransfer.appendFeePayerSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
feeDelegatedValueTransfer.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
feeDelegatedValueTransfer.getRawTransaction()

// $ExpectType string
feeDelegatedValueTransfer.getTransactionHash()

// $ExpectType string
feeDelegatedValueTransfer.getSenderTxHash()

// $ExpectType string
feeDelegatedValueTransfer.getRLPEncodingForSignature()

// $ExpectType string
feeDelegatedValueTransfer.getRLPEncodingForFeePayerSignature()

// $ExpectType string[]
feeDelegatedValueTransfer.recoverPublicKeys()

// $ExpectType string[]
feeDelegatedValueTransfer.recoverFeePayerPublicKeys()

// $ExpectType Promise<void>
feeDelegatedValueTransfer.fillTransaction()

// $ExpectType void
feeDelegatedValueTransfer.validateOptionalValues()

// $ExpectType string
feeDelegatedValueTransfer.type
// $ExpectType string
feeDelegatedValueTransfer.from
// $ExpectType string
feeDelegatedValueTransfer.nonce
// $ExpectType string
feeDelegatedValueTransfer.gas
// $ExpectType string
feeDelegatedValueTransfer.gasPrice
// $ExpectType string
feeDelegatedValueTransfer.chainId
// $ExpectType SignatureData[]
feeDelegatedValueTransfer.signatures
// $ExpectType string
feeDelegatedValueTransfer.to
// $ExpectType string
feeDelegatedValueTransfer.value
// $ExpectType string
feeDelegatedValueTransfer.feePayer
// $ExpectType SignatureData[]
feeDelegatedValueTransfer.feePayerSignatures

const feeDelegatedValueTransferMemo = new FeeDelegatedValueTransferMemo({})

// $ExpectType string
feeDelegatedValueTransferMemo.getRLPEncoding()

// $ExpectType string
feeDelegatedValueTransferMemo.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemo.sign('string')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemo.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemo.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemo.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemo.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemo.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemo.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemo.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemo.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemo.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemo.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemo.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemo.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemo.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemo.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemo.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemo.signAsFeePayer('string')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemo.signAsFeePayer(keyrings.single)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemo.signAsFeePayer(keyrings.multiple)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemo.signAsFeePayer(keyrings.roleBased)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemo.signAsFeePayer('string', 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemo.signAsFeePayer(keyrings.single, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemo.signAsFeePayer(keyrings.multiple, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemo.signAsFeePayer(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemo.signAsFeePayer('string', (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemo.signAsFeePayer(keyrings.single, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemo.signAsFeePayer(keyrings.multiple, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemo.signAsFeePayer(keyrings.roleBased, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemo.signAsFeePayer('string', 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemo.signAsFeePayer(keyrings.single, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemo.signAsFeePayer(keyrings.multiple, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemo.signAsFeePayer(keyrings.roleBased, 0, (tx: AbstractFeeDelegatedTransaction) => '')

// $ExpectType void
feeDelegatedValueTransferMemo.appendSignatures(sig)
// $ExpectType void
feeDelegatedValueTransferMemo.appendSignatures([sig, sig])
// $ExpectType void
feeDelegatedValueTransferMemo.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedValueTransferMemo.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType void
feeDelegatedValueTransferMemo.appendFeePayerSignatures(sig)
// $ExpectType void
feeDelegatedValueTransferMemo.appendFeePayerSignatures([sig, sig])
// $ExpectType void
feeDelegatedValueTransferMemo.appendFeePayerSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedValueTransferMemo.appendFeePayerSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
feeDelegatedValueTransferMemo.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
feeDelegatedValueTransferMemo.getRawTransaction()

// $ExpectType string
feeDelegatedValueTransferMemo.getTransactionHash()

// $ExpectType string
feeDelegatedValueTransferMemo.getSenderTxHash()

// $ExpectType string
feeDelegatedValueTransferMemo.getRLPEncodingForSignature()

// $ExpectType string
feeDelegatedValueTransferMemo.getRLPEncodingForFeePayerSignature()

// $ExpectType string[]
feeDelegatedValueTransferMemo.recoverPublicKeys()

// $ExpectType string[]
feeDelegatedValueTransferMemo.recoverFeePayerPublicKeys()

// $ExpectType Promise<void>
feeDelegatedValueTransferMemo.fillTransaction()

// $ExpectType void
feeDelegatedValueTransferMemo.validateOptionalValues()

// $ExpectType string
feeDelegatedValueTransferMemo.type
// $ExpectType string
feeDelegatedValueTransferMemo.from
// $ExpectType string
feeDelegatedValueTransferMemo.nonce
// $ExpectType string
feeDelegatedValueTransferMemo.gas
// $ExpectType string
feeDelegatedValueTransferMemo.gasPrice
// $ExpectType string
feeDelegatedValueTransferMemo.chainId
// $ExpectType SignatureData[]
feeDelegatedValueTransferMemo.signatures
// $ExpectType string
feeDelegatedValueTransferMemo.to
// $ExpectType string
feeDelegatedValueTransferMemo.value
// $ExpectType string
feeDelegatedValueTransferMemo.input
// $ExpectType string
feeDelegatedValueTransferMemo.data
// $ExpectType string
feeDelegatedValueTransferMemo.feePayer
// $ExpectType SignatureData[]
feeDelegatedValueTransferMemo.feePayerSignatures

const feeDelegatedAccountUpdate = new FeeDelegatedAccountUpdate({})

// $ExpectType string
feeDelegatedAccountUpdate.getRLPEncoding()

// $ExpectType string
feeDelegatedAccountUpdate.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdate.sign('string')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdate.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdate.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdate.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdate.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdate.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdate.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdate.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdate.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdate.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdate.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdate.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdate.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdate.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdate.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdate.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdate.signAsFeePayer('string')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdate.signAsFeePayer(keyrings.single)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdate.signAsFeePayer(keyrings.multiple)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdate.signAsFeePayer(keyrings.roleBased)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdate.signAsFeePayer('string', 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdate.signAsFeePayer(keyrings.single, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdate.signAsFeePayer(keyrings.multiple, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdate.signAsFeePayer(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdate.signAsFeePayer('string', (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdate.signAsFeePayer(keyrings.single, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdate.signAsFeePayer(keyrings.multiple, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdate.signAsFeePayer(keyrings.roleBased, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdate.signAsFeePayer('string', 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdate.signAsFeePayer(keyrings.single, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdate.signAsFeePayer(keyrings.multiple, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdate.signAsFeePayer(keyrings.roleBased, 0, (tx: AbstractFeeDelegatedTransaction) => '')

// $ExpectType void
feeDelegatedAccountUpdate.appendSignatures(sig)
// $ExpectType void
feeDelegatedAccountUpdate.appendSignatures([sig, sig])
// $ExpectType void
feeDelegatedAccountUpdate.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedAccountUpdate.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType void
feeDelegatedAccountUpdate.appendFeePayerSignatures(sig)
// $ExpectType void
feeDelegatedAccountUpdate.appendFeePayerSignatures([sig, sig])
// $ExpectType void
feeDelegatedAccountUpdate.appendFeePayerSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedAccountUpdate.appendFeePayerSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
feeDelegatedAccountUpdate.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
feeDelegatedAccountUpdate.getRawTransaction()

// $ExpectType string
feeDelegatedAccountUpdate.getTransactionHash()

// $ExpectType string
feeDelegatedAccountUpdate.getSenderTxHash()

// $ExpectType string
feeDelegatedAccountUpdate.getRLPEncodingForSignature()

// $ExpectType string
feeDelegatedAccountUpdate.getRLPEncodingForFeePayerSignature()

// $ExpectType string[]
feeDelegatedAccountUpdate.recoverPublicKeys()

// $ExpectType string[]
feeDelegatedAccountUpdate.recoverFeePayerPublicKeys()

// $ExpectType Promise<void>
feeDelegatedAccountUpdate.fillTransaction()

// $ExpectType void
feeDelegatedAccountUpdate.validateOptionalValues()

// $ExpectType string
feeDelegatedAccountUpdate.type
// $ExpectType string
feeDelegatedAccountUpdate.from
// $ExpectType string
feeDelegatedAccountUpdate.nonce
// $ExpectType string
feeDelegatedAccountUpdate.gas
// $ExpectType string
feeDelegatedAccountUpdate.gasPrice
// $ExpectType string
feeDelegatedAccountUpdate.chainId
// $ExpectType SignatureData[]
feeDelegatedAccountUpdate.signatures
// $ExpectType Account
feeDelegatedAccountUpdate.account
// $ExpectType string
feeDelegatedAccountUpdate.feePayer
// $ExpectType SignatureData[]
feeDelegatedAccountUpdate.feePayerSignatures

const feeDelegatedSmartContractDeploy = new FeeDelegatedSmartContractDeploy({})

// $ExpectType string
feeDelegatedSmartContractDeploy.getRLPEncoding()

// $ExpectType string
feeDelegatedSmartContractDeploy.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeploy.sign('string')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeploy.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeploy.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeploy.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeploy.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeploy.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeploy.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeploy.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeploy.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeploy.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeploy.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeploy.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeploy.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeploy.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeploy.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeploy.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeploy.signAsFeePayer('string')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeploy.signAsFeePayer(keyrings.single)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeploy.signAsFeePayer(keyrings.multiple)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeploy.signAsFeePayer(keyrings.roleBased)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeploy.signAsFeePayer('string', 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeploy.signAsFeePayer(keyrings.single, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeploy.signAsFeePayer(keyrings.multiple, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeploy.signAsFeePayer(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeploy.signAsFeePayer('string', (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeploy.signAsFeePayer(keyrings.single, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeploy.signAsFeePayer(keyrings.multiple, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeploy.signAsFeePayer(keyrings.roleBased, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeploy.signAsFeePayer('string', 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeploy.signAsFeePayer(keyrings.single, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeploy.signAsFeePayer(keyrings.multiple, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeploy.signAsFeePayer(keyrings.roleBased, 0, (tx: AbstractFeeDelegatedTransaction) => '')

// $ExpectType void
feeDelegatedSmartContractDeploy.appendSignatures(sig)
// $ExpectType void
feeDelegatedSmartContractDeploy.appendSignatures([sig, sig])
// $ExpectType void
feeDelegatedSmartContractDeploy.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedSmartContractDeploy.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType void
feeDelegatedSmartContractDeploy.appendFeePayerSignatures(sig)
// $ExpectType void
feeDelegatedSmartContractDeploy.appendFeePayerSignatures([sig, sig])
// $ExpectType void
feeDelegatedSmartContractDeploy.appendFeePayerSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedSmartContractDeploy.appendFeePayerSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
feeDelegatedSmartContractDeploy.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
feeDelegatedSmartContractDeploy.getRawTransaction()

// $ExpectType string
feeDelegatedSmartContractDeploy.getTransactionHash()

// $ExpectType string
feeDelegatedSmartContractDeploy.getSenderTxHash()

// $ExpectType string
feeDelegatedSmartContractDeploy.getRLPEncodingForSignature()

// $ExpectType string
feeDelegatedSmartContractDeploy.getRLPEncodingForFeePayerSignature()

// $ExpectType string[]
feeDelegatedSmartContractDeploy.recoverPublicKeys()

// $ExpectType string[]
feeDelegatedSmartContractDeploy.recoverFeePayerPublicKeys()

// $ExpectType Promise<void>
feeDelegatedSmartContractDeploy.fillTransaction()

// $ExpectType void
feeDelegatedSmartContractDeploy.validateOptionalValues()

// $ExpectType string
feeDelegatedSmartContractDeploy.type
// $ExpectType string
feeDelegatedSmartContractDeploy.from
// $ExpectType string
feeDelegatedSmartContractDeploy.nonce
// $ExpectType string
feeDelegatedSmartContractDeploy.gas
// $ExpectType string
feeDelegatedSmartContractDeploy.gasPrice
// $ExpectType string
feeDelegatedSmartContractDeploy.chainId
// $ExpectType SignatureData[]
feeDelegatedSmartContractDeploy.signatures
// $ExpectType string
feeDelegatedSmartContractDeploy.to
// $ExpectType string
feeDelegatedSmartContractDeploy.value
// $ExpectType string
feeDelegatedSmartContractDeploy.input
// $ExpectType string
feeDelegatedSmartContractDeploy.data
// $ExpectType boolean
feeDelegatedSmartContractDeploy.humanReadable
// $ExpectType string
feeDelegatedSmartContractDeploy.codeFormat
// $ExpectType string
feeDelegatedSmartContractDeploy.feePayer
// $ExpectType SignatureData[]
feeDelegatedSmartContractDeploy.feePayerSignatures

const feeDelegatedSmartContractExecution = new FeeDelegatedSmartContractExecution({})

// $ExpectType string
feeDelegatedSmartContractExecution.getRLPEncoding()

// $ExpectType string
feeDelegatedSmartContractExecution.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecution.sign('string')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecution.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecution.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecution.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecution.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecution.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecution.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecution.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecution.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecution.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecution.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecution.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecution.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecution.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecution.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecution.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecution.signAsFeePayer('string')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecution.signAsFeePayer(keyrings.single)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecution.signAsFeePayer(keyrings.multiple)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecution.signAsFeePayer(keyrings.roleBased)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecution.signAsFeePayer('string', 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecution.signAsFeePayer(keyrings.single, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecution.signAsFeePayer(keyrings.multiple, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecution.signAsFeePayer(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecution.signAsFeePayer('string', (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecution.signAsFeePayer(keyrings.single, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecution.signAsFeePayer(keyrings.multiple, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecution.signAsFeePayer(keyrings.roleBased, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecution.signAsFeePayer('string', 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecution.signAsFeePayer(keyrings.single, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecution.signAsFeePayer(keyrings.multiple, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecution.signAsFeePayer(keyrings.roleBased, 0, (tx: AbstractFeeDelegatedTransaction) => '')

// $ExpectType void
feeDelegatedSmartContractExecution.appendSignatures(sig)
// $ExpectType void
feeDelegatedSmartContractExecution.appendSignatures([sig, sig])
// $ExpectType void
feeDelegatedSmartContractExecution.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedSmartContractExecution.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType void
feeDelegatedSmartContractExecution.appendFeePayerSignatures(sig)
// $ExpectType void
feeDelegatedSmartContractExecution.appendFeePayerSignatures([sig, sig])
// $ExpectType void
feeDelegatedSmartContractExecution.appendFeePayerSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedSmartContractExecution.appendFeePayerSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
feeDelegatedSmartContractExecution.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
feeDelegatedSmartContractExecution.getRawTransaction()

// $ExpectType string
feeDelegatedSmartContractExecution.getTransactionHash()

// $ExpectType string
feeDelegatedSmartContractExecution.getSenderTxHash()

// $ExpectType string
feeDelegatedSmartContractExecution.getRLPEncodingForSignature()

// $ExpectType string
feeDelegatedSmartContractExecution.getRLPEncodingForFeePayerSignature()

// $ExpectType string[]
feeDelegatedSmartContractExecution.recoverPublicKeys()

// $ExpectType string[]
feeDelegatedSmartContractExecution.recoverFeePayerPublicKeys()

// $ExpectType Promise<void>
feeDelegatedSmartContractExecution.fillTransaction()

// $ExpectType void
feeDelegatedSmartContractExecution.validateOptionalValues()

// $ExpectType string
feeDelegatedSmartContractExecution.type
// $ExpectType string
feeDelegatedSmartContractExecution.from
// $ExpectType string
feeDelegatedSmartContractExecution.nonce
// $ExpectType string
feeDelegatedSmartContractExecution.gas
// $ExpectType string
feeDelegatedSmartContractExecution.gasPrice
// $ExpectType string
feeDelegatedSmartContractExecution.chainId
// $ExpectType SignatureData[]
feeDelegatedSmartContractExecution.signatures
// $ExpectType string
feeDelegatedSmartContractExecution.to
// $ExpectType string
feeDelegatedSmartContractExecution.value
// $ExpectType string
feeDelegatedSmartContractExecution.input
// $ExpectType string
feeDelegatedSmartContractExecution.data
// $ExpectType string
feeDelegatedSmartContractExecution.feePayer
// $ExpectType SignatureData[]
feeDelegatedSmartContractExecution.feePayerSignatures

const feeDelegatedCancel = new FeeDelegatedCancel({})

// $ExpectType string
feeDelegatedCancel.getRLPEncoding()

// $ExpectType string
feeDelegatedCancel.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancel.sign('string')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancel.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancel.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancel.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancel.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancel.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancel.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancel.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancel.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancel.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancel.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancel.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancel.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancel.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancel.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancel.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancel.signAsFeePayer('string')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancel.signAsFeePayer(keyrings.single)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancel.signAsFeePayer(keyrings.multiple)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancel.signAsFeePayer(keyrings.roleBased)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancel.signAsFeePayer('string', 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancel.signAsFeePayer(keyrings.single, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancel.signAsFeePayer(keyrings.multiple, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancel.signAsFeePayer(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancel.signAsFeePayer('string', (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancel.signAsFeePayer(keyrings.single, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancel.signAsFeePayer(keyrings.multiple, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancel.signAsFeePayer(keyrings.roleBased, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancel.signAsFeePayer('string', 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancel.signAsFeePayer(keyrings.single, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancel.signAsFeePayer(keyrings.multiple, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancel.signAsFeePayer(keyrings.roleBased, 0, (tx: AbstractFeeDelegatedTransaction) => '')

// $ExpectType void
feeDelegatedCancel.appendSignatures(sig)
// $ExpectType void
feeDelegatedCancel.appendSignatures([sig, sig])
// $ExpectType void
feeDelegatedCancel.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedCancel.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType void
feeDelegatedCancel.appendFeePayerSignatures(sig)
// $ExpectType void
feeDelegatedCancel.appendFeePayerSignatures([sig, sig])
// $ExpectType void
feeDelegatedCancel.appendFeePayerSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedCancel.appendFeePayerSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
feeDelegatedCancel.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
feeDelegatedCancel.getRawTransaction()

// $ExpectType string
feeDelegatedCancel.getTransactionHash()

// $ExpectType string
feeDelegatedCancel.getSenderTxHash()

// $ExpectType string
feeDelegatedCancel.getRLPEncodingForSignature()

// $ExpectType string
feeDelegatedCancel.getRLPEncodingForFeePayerSignature()

// $ExpectType string[]
feeDelegatedCancel.recoverPublicKeys()

// $ExpectType string[]
feeDelegatedCancel.recoverFeePayerPublicKeys()

// $ExpectType Promise<void>
feeDelegatedCancel.fillTransaction()

// $ExpectType void
feeDelegatedCancel.validateOptionalValues()

// $ExpectType string
feeDelegatedCancel.type
// $ExpectType string
feeDelegatedCancel.from
// $ExpectType string
feeDelegatedCancel.nonce
// $ExpectType string
feeDelegatedCancel.gas
// $ExpectType string
feeDelegatedCancel.gasPrice
// $ExpectType string
feeDelegatedCancel.chainId
// $ExpectType SignatureData[]
feeDelegatedCancel.signatures
// $ExpectType string
feeDelegatedCancel.feePayer
// $ExpectType SignatureData[]
feeDelegatedCancel.feePayerSignatures

const feeDelegatedChainDataAnchoring = new FeeDelegatedChainDataAnchoring({})

// $ExpectType string
feeDelegatedChainDataAnchoring.getRLPEncoding()

// $ExpectType string
feeDelegatedChainDataAnchoring.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoring.sign('string')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoring.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoring.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoring.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoring.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoring.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoring.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoring.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoring.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoring.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoring.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoring.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoring.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoring.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoring.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoring.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoring.signAsFeePayer('string')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoring.signAsFeePayer(keyrings.single)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoring.signAsFeePayer(keyrings.multiple)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoring.signAsFeePayer(keyrings.roleBased)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoring.signAsFeePayer('string', 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoring.signAsFeePayer(keyrings.single, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoring.signAsFeePayer(keyrings.multiple, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoring.signAsFeePayer(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoring.signAsFeePayer('string', (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoring.signAsFeePayer(keyrings.single, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoring.signAsFeePayer(keyrings.multiple, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoring.signAsFeePayer(keyrings.roleBased, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoring.signAsFeePayer('string', 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoring.signAsFeePayer(keyrings.single, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoring.signAsFeePayer(keyrings.multiple, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoring.signAsFeePayer(keyrings.roleBased, 0, (tx: AbstractFeeDelegatedTransaction) => '')

// $ExpectType void
feeDelegatedChainDataAnchoring.appendSignatures(sig)
// $ExpectType void
feeDelegatedChainDataAnchoring.appendSignatures([sig, sig])
// $ExpectType void
feeDelegatedChainDataAnchoring.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedChainDataAnchoring.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType void
feeDelegatedChainDataAnchoring.appendFeePayerSignatures(sig)
// $ExpectType void
feeDelegatedChainDataAnchoring.appendFeePayerSignatures([sig, sig])
// $ExpectType void
feeDelegatedChainDataAnchoring.appendFeePayerSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedChainDataAnchoring.appendFeePayerSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
feeDelegatedChainDataAnchoring.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
feeDelegatedChainDataAnchoring.getRawTransaction()

// $ExpectType string
feeDelegatedChainDataAnchoring.getTransactionHash()

// $ExpectType string
feeDelegatedChainDataAnchoring.getSenderTxHash()

// $ExpectType string
feeDelegatedChainDataAnchoring.getRLPEncodingForSignature()

// $ExpectType string
feeDelegatedChainDataAnchoring.getRLPEncodingForFeePayerSignature()

// $ExpectType string[]
feeDelegatedChainDataAnchoring.recoverPublicKeys()

// $ExpectType string[]
feeDelegatedChainDataAnchoring.recoverFeePayerPublicKeys()

// $ExpectType Promise<void>
feeDelegatedChainDataAnchoring.fillTransaction()

// $ExpectType void
feeDelegatedChainDataAnchoring.validateOptionalValues()

// $ExpectType string
feeDelegatedChainDataAnchoring.type
// $ExpectType string
feeDelegatedChainDataAnchoring.from
// $ExpectType string
feeDelegatedChainDataAnchoring.nonce
// $ExpectType string
feeDelegatedChainDataAnchoring.gas
// $ExpectType string
feeDelegatedChainDataAnchoring.gasPrice
// $ExpectType string
feeDelegatedChainDataAnchoring.chainId
// $ExpectType SignatureData[]
feeDelegatedChainDataAnchoring.signatures
// $ExpectType string
feeDelegatedChainDataAnchoring.input
// $ExpectType string
feeDelegatedChainDataAnchoring.feePayer
// $ExpectType SignatureData[]
feeDelegatedChainDataAnchoring.feePayerSignatures

const feeDelegatedValueTransferWithRatio = new FeeDelegatedValueTransferWithRatio({})

// $ExpectType string
feeDelegatedValueTransferWithRatio.getRLPEncoding()

// $ExpectType string
feeDelegatedValueTransferWithRatio.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferWithRatio.sign('string')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferWithRatio.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferWithRatio.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferWithRatio.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferWithRatio.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferWithRatio.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferWithRatio.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferWithRatio.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferWithRatio.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferWithRatio.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferWithRatio.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferWithRatio.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferWithRatio.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferWithRatio.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferWithRatio.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferWithRatio.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferWithRatio.signAsFeePayer('string')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferWithRatio.signAsFeePayer(keyrings.single)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferWithRatio.signAsFeePayer(keyrings.multiple)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferWithRatio.signAsFeePayer(keyrings.roleBased)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferWithRatio.signAsFeePayer('string', 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferWithRatio.signAsFeePayer(keyrings.single, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferWithRatio.signAsFeePayer(keyrings.multiple, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferWithRatio.signAsFeePayer(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferWithRatio.signAsFeePayer('string', (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferWithRatio.signAsFeePayer(keyrings.single, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferWithRatio.signAsFeePayer(keyrings.multiple, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferWithRatio.signAsFeePayer(keyrings.roleBased, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferWithRatio.signAsFeePayer('string', 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferWithRatio.signAsFeePayer(keyrings.single, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferWithRatio.signAsFeePayer(keyrings.multiple, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferWithRatio.signAsFeePayer(keyrings.roleBased, 0, (tx: AbstractFeeDelegatedTransaction) => '')

// $ExpectType void
feeDelegatedValueTransferWithRatio.appendSignatures(sig)
// $ExpectType void
feeDelegatedValueTransferWithRatio.appendSignatures([sig, sig])
// $ExpectType void
feeDelegatedValueTransferWithRatio.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedValueTransferWithRatio.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType void
feeDelegatedValueTransferWithRatio.appendFeePayerSignatures(sig)
// $ExpectType void
feeDelegatedValueTransferWithRatio.appendFeePayerSignatures([sig, sig])
// $ExpectType void
feeDelegatedValueTransferWithRatio.appendFeePayerSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedValueTransferWithRatio.appendFeePayerSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
feeDelegatedValueTransferWithRatio.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
feeDelegatedValueTransferWithRatio.getRawTransaction()

// $ExpectType string
feeDelegatedValueTransferWithRatio.getTransactionHash()

// $ExpectType string
feeDelegatedValueTransferWithRatio.getSenderTxHash()

// $ExpectType string
feeDelegatedValueTransferWithRatio.getRLPEncodingForSignature()

// $ExpectType string
feeDelegatedValueTransferWithRatio.getRLPEncodingForFeePayerSignature()

// $ExpectType string[]
feeDelegatedValueTransferWithRatio.recoverPublicKeys()

// $ExpectType string[]
feeDelegatedValueTransferWithRatio.recoverFeePayerPublicKeys()

// $ExpectType Promise<void>
feeDelegatedValueTransferWithRatio.fillTransaction()

// $ExpectType void
feeDelegatedValueTransferWithRatio.validateOptionalValues()

// $ExpectType string
feeDelegatedValueTransferWithRatio.type
// $ExpectType string
feeDelegatedValueTransferWithRatio.from
// $ExpectType string
feeDelegatedValueTransferWithRatio.nonce
// $ExpectType string
feeDelegatedValueTransferWithRatio.gas
// $ExpectType string
feeDelegatedValueTransferWithRatio.gasPrice
// $ExpectType string
feeDelegatedValueTransferWithRatio.chainId
// $ExpectType SignatureData[]
feeDelegatedValueTransferWithRatio.signatures
// $ExpectType string
feeDelegatedValueTransferWithRatio.to
// $ExpectType string
feeDelegatedValueTransferWithRatio.value
// $ExpectType string
feeDelegatedValueTransferWithRatio.feePayer
// $ExpectType SignatureData[]
feeDelegatedValueTransferWithRatio.feePayerSignatures
// $ExpectType string
feeDelegatedValueTransferWithRatio.feeRatio

const feeDelegatedValueTransferMemoWithRatio = new FeeDelegatedValueTransferMemoWithRatio({})

// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.getRLPEncoding()

// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemoWithRatio.sign('string')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemoWithRatio.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemoWithRatio.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemoWithRatio.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemoWithRatio.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemoWithRatio.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemoWithRatio.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemoWithRatio.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemoWithRatio.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemoWithRatio.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemoWithRatio.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemoWithRatio.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemoWithRatio.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemoWithRatio.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemoWithRatio.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedValueTransferMemoWithRatio.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemoWithRatio.signAsFeePayer('string')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemoWithRatio.signAsFeePayer(keyrings.single)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemoWithRatio.signAsFeePayer(keyrings.multiple)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemoWithRatio.signAsFeePayer(keyrings.roleBased)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemoWithRatio.signAsFeePayer('string', 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemoWithRatio.signAsFeePayer(keyrings.single, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemoWithRatio.signAsFeePayer(keyrings.multiple, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemoWithRatio.signAsFeePayer(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemoWithRatio.signAsFeePayer('string', (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemoWithRatio.signAsFeePayer(keyrings.single, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemoWithRatio.signAsFeePayer(keyrings.multiple, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemoWithRatio.signAsFeePayer(keyrings.roleBased, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemoWithRatio.signAsFeePayer('string', 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemoWithRatio.signAsFeePayer(keyrings.single, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemoWithRatio.signAsFeePayer(keyrings.multiple, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedValueTransferMemoWithRatio.signAsFeePayer(keyrings.roleBased, 0, (tx: AbstractFeeDelegatedTransaction) => '')

// $ExpectType void
feeDelegatedValueTransferMemoWithRatio.appendSignatures(sig)
// $ExpectType void
feeDelegatedValueTransferMemoWithRatio.appendSignatures([sig, sig])
// $ExpectType void
feeDelegatedValueTransferMemoWithRatio.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedValueTransferMemoWithRatio.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType void
feeDelegatedValueTransferMemoWithRatio.appendFeePayerSignatures(sig)
// $ExpectType void
feeDelegatedValueTransferMemoWithRatio.appendFeePayerSignatures([sig, sig])
// $ExpectType void
feeDelegatedValueTransferMemoWithRatio.appendFeePayerSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedValueTransferMemoWithRatio.appendFeePayerSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.getRawTransaction()

// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.getTransactionHash()

// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.getSenderTxHash()

// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.getRLPEncodingForSignature()

// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.getRLPEncodingForFeePayerSignature()

// $ExpectType string[]
feeDelegatedValueTransferMemoWithRatio.recoverPublicKeys()

// $ExpectType string[]
feeDelegatedValueTransferMemoWithRatio.recoverFeePayerPublicKeys()

// $ExpectType Promise<void>
feeDelegatedValueTransferMemoWithRatio.fillTransaction()

// $ExpectType void
feeDelegatedValueTransferMemoWithRatio.validateOptionalValues()

// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.type
// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.from
// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.nonce
// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.gas
// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.gasPrice
// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.chainId
// $ExpectType SignatureData[]
feeDelegatedValueTransferMemoWithRatio.signatures
// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.to
// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.value
// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.input
// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.data
// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.feePayer
// $ExpectType SignatureData[]
feeDelegatedValueTransferMemoWithRatio.feePayerSignatures
// $ExpectType string
feeDelegatedValueTransferMemoWithRatio.feeRatio

const feeDelegatedAccountUpdateWithRatio = new FeeDelegatedAccountUpdateWithRatio({})

// $ExpectType string
feeDelegatedAccountUpdateWithRatio.getRLPEncoding()

// $ExpectType string
feeDelegatedAccountUpdateWithRatio.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdateWithRatio.sign('string')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdateWithRatio.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdateWithRatio.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdateWithRatio.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdateWithRatio.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdateWithRatio.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdateWithRatio.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdateWithRatio.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdateWithRatio.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdateWithRatio.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdateWithRatio.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdateWithRatio.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdateWithRatio.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdateWithRatio.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdateWithRatio.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedAccountUpdateWithRatio.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdateWithRatio.signAsFeePayer('string')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdateWithRatio.signAsFeePayer(keyrings.single)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdateWithRatio.signAsFeePayer(keyrings.multiple)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdateWithRatio.signAsFeePayer(keyrings.roleBased)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdateWithRatio.signAsFeePayer('string', 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdateWithRatio.signAsFeePayer(keyrings.single, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdateWithRatio.signAsFeePayer(keyrings.multiple, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdateWithRatio.signAsFeePayer(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdateWithRatio.signAsFeePayer('string', (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdateWithRatio.signAsFeePayer(keyrings.single, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdateWithRatio.signAsFeePayer(keyrings.multiple, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdateWithRatio.signAsFeePayer(keyrings.roleBased, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdateWithRatio.signAsFeePayer('string', 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdateWithRatio.signAsFeePayer(keyrings.single, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdateWithRatio.signAsFeePayer(keyrings.multiple, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedAccountUpdateWithRatio.signAsFeePayer(keyrings.roleBased, 0, (tx: AbstractFeeDelegatedTransaction) => '')

// $ExpectType void
feeDelegatedAccountUpdateWithRatio.appendSignatures(sig)
// $ExpectType void
feeDelegatedAccountUpdateWithRatio.appendSignatures([sig, sig])
// $ExpectType void
feeDelegatedAccountUpdateWithRatio.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedAccountUpdateWithRatio.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType void
feeDelegatedAccountUpdateWithRatio.appendFeePayerSignatures(sig)
// $ExpectType void
feeDelegatedAccountUpdateWithRatio.appendFeePayerSignatures([sig, sig])
// $ExpectType void
feeDelegatedAccountUpdateWithRatio.appendFeePayerSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedAccountUpdateWithRatio.appendFeePayerSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
feeDelegatedAccountUpdateWithRatio.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
feeDelegatedAccountUpdateWithRatio.getRawTransaction()

// $ExpectType string
feeDelegatedAccountUpdateWithRatio.getTransactionHash()

// $ExpectType string
feeDelegatedAccountUpdateWithRatio.getSenderTxHash()

// $ExpectType string
feeDelegatedAccountUpdateWithRatio.getRLPEncodingForSignature()

// $ExpectType string
feeDelegatedAccountUpdateWithRatio.getRLPEncodingForFeePayerSignature()

// $ExpectType string[]
feeDelegatedAccountUpdateWithRatio.recoverPublicKeys()

// $ExpectType string[]
feeDelegatedAccountUpdateWithRatio.recoverFeePayerPublicKeys()

// $ExpectType Promise<void>
feeDelegatedAccountUpdateWithRatio.fillTransaction()

// $ExpectType void
feeDelegatedAccountUpdateWithRatio.validateOptionalValues()

// $ExpectType string
feeDelegatedAccountUpdateWithRatio.type
// $ExpectType string
feeDelegatedAccountUpdateWithRatio.from
// $ExpectType string
feeDelegatedAccountUpdateWithRatio.nonce
// $ExpectType string
feeDelegatedAccountUpdateWithRatio.gas
// $ExpectType string
feeDelegatedAccountUpdateWithRatio.gasPrice
// $ExpectType string
feeDelegatedAccountUpdateWithRatio.chainId
// $ExpectType SignatureData[]
feeDelegatedAccountUpdateWithRatio.signatures
// $ExpectType Account
feeDelegatedAccountUpdateWithRatio.account
// $ExpectType string
feeDelegatedAccountUpdateWithRatio.feePayer
// $ExpectType SignatureData[]
feeDelegatedAccountUpdateWithRatio.feePayerSignatures
// $ExpectType string
feeDelegatedAccountUpdateWithRatio.feeRatio

const feeDelegatedSmartContractDeployWithRatio = new FeeDelegatedSmartContractDeployWithRatio({})

// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.getRLPEncoding()

// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeployWithRatio.sign('string')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeployWithRatio.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeployWithRatio.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeployWithRatio.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeployWithRatio.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeployWithRatio.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeployWithRatio.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeployWithRatio.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeployWithRatio.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeployWithRatio.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeployWithRatio.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeployWithRatio.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeployWithRatio.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeployWithRatio.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeployWithRatio.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractDeployWithRatio.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeployWithRatio.signAsFeePayer('string')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeployWithRatio.signAsFeePayer(keyrings.single)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeployWithRatio.signAsFeePayer(keyrings.multiple)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeployWithRatio.signAsFeePayer(keyrings.roleBased)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeployWithRatio.signAsFeePayer('string', 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeployWithRatio.signAsFeePayer(keyrings.single, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeployWithRatio.signAsFeePayer(keyrings.multiple, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeployWithRatio.signAsFeePayer(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeployWithRatio.signAsFeePayer('string', (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeployWithRatio.signAsFeePayer(keyrings.single, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeployWithRatio.signAsFeePayer(keyrings.multiple, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeployWithRatio.signAsFeePayer(keyrings.roleBased, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeployWithRatio.signAsFeePayer('string', 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeployWithRatio.signAsFeePayer(keyrings.single, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeployWithRatio.signAsFeePayer(keyrings.multiple, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractDeployWithRatio.signAsFeePayer(keyrings.roleBased, 0, (tx: AbstractFeeDelegatedTransaction) => '')

// $ExpectType void
feeDelegatedSmartContractDeployWithRatio.appendSignatures(sig)
// $ExpectType void
feeDelegatedSmartContractDeployWithRatio.appendSignatures([sig, sig])
// $ExpectType void
feeDelegatedSmartContractDeployWithRatio.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedSmartContractDeployWithRatio.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType void
feeDelegatedSmartContractDeployWithRatio.appendFeePayerSignatures(sig)
// $ExpectType void
feeDelegatedSmartContractDeployWithRatio.appendFeePayerSignatures([sig, sig])
// $ExpectType void
feeDelegatedSmartContractDeployWithRatio.appendFeePayerSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedSmartContractDeployWithRatio.appendFeePayerSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.getRawTransaction()

// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.getTransactionHash()

// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.getSenderTxHash()

// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.getRLPEncodingForSignature()

// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.getRLPEncodingForFeePayerSignature()

// $ExpectType string[]
feeDelegatedSmartContractDeployWithRatio.recoverPublicKeys()

// $ExpectType string[]
feeDelegatedSmartContractDeployWithRatio.recoverFeePayerPublicKeys()

// $ExpectType Promise<void>
feeDelegatedSmartContractDeployWithRatio.fillTransaction()

// $ExpectType void
feeDelegatedSmartContractDeployWithRatio.validateOptionalValues()

// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.type
// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.from
// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.nonce
// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.gas
// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.gasPrice
// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.chainId
// $ExpectType SignatureData[]
feeDelegatedSmartContractDeployWithRatio.signatures
// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.to
// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.value
// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.input
// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.data
// $ExpectType boolean
feeDelegatedSmartContractDeployWithRatio.humanReadable
// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.codeFormat
// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.feePayer
// $ExpectType SignatureData[]
feeDelegatedSmartContractDeployWithRatio.feePayerSignatures
// $ExpectType string
feeDelegatedSmartContractDeployWithRatio.feeRatio

const feeDelegatedSmartContractExecutionWithRatio = new FeeDelegatedSmartContractExecutionWithRatio({})

// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.getRLPEncoding()

// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecutionWithRatio.sign('string')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecutionWithRatio.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecutionWithRatio.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecutionWithRatio.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecutionWithRatio.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecutionWithRatio.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecutionWithRatio.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecutionWithRatio.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecutionWithRatio.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecutionWithRatio.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecutionWithRatio.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecutionWithRatio.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecutionWithRatio.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecutionWithRatio.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecutionWithRatio.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedSmartContractExecutionWithRatio.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecutionWithRatio.signAsFeePayer('string')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecutionWithRatio.signAsFeePayer(keyrings.single)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecutionWithRatio.signAsFeePayer(keyrings.multiple)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecutionWithRatio.signAsFeePayer(keyrings.roleBased)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecutionWithRatio.signAsFeePayer('string', 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecutionWithRatio.signAsFeePayer(keyrings.single, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecutionWithRatio.signAsFeePayer(keyrings.multiple, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecutionWithRatio.signAsFeePayer(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecutionWithRatio.signAsFeePayer('string', (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecutionWithRatio.signAsFeePayer(keyrings.single, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecutionWithRatio.signAsFeePayer(keyrings.multiple, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecutionWithRatio.signAsFeePayer(keyrings.roleBased, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecutionWithRatio.signAsFeePayer('string', 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecutionWithRatio.signAsFeePayer(keyrings.single, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecutionWithRatio.signAsFeePayer(keyrings.multiple, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedSmartContractExecutionWithRatio.signAsFeePayer(keyrings.roleBased, 0, (tx: AbstractFeeDelegatedTransaction) => '')

// $ExpectType void
feeDelegatedSmartContractExecutionWithRatio.appendSignatures(sig)
// $ExpectType void
feeDelegatedSmartContractExecutionWithRatio.appendSignatures([sig, sig])
// $ExpectType void
feeDelegatedSmartContractExecutionWithRatio.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedSmartContractExecutionWithRatio.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType void
feeDelegatedSmartContractExecutionWithRatio.appendFeePayerSignatures(sig)
// $ExpectType void
feeDelegatedSmartContractExecutionWithRatio.appendFeePayerSignatures([sig, sig])
// $ExpectType void
feeDelegatedSmartContractExecutionWithRatio.appendFeePayerSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedSmartContractExecutionWithRatio.appendFeePayerSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.getRawTransaction()

// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.getTransactionHash()

// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.getSenderTxHash()

// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.getRLPEncodingForSignature()

// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.getRLPEncodingForFeePayerSignature()

// $ExpectType string[]
feeDelegatedSmartContractExecutionWithRatio.recoverPublicKeys()

// $ExpectType string[]
feeDelegatedSmartContractExecutionWithRatio.recoverFeePayerPublicKeys()

// $ExpectType Promise<void>
feeDelegatedSmartContractExecutionWithRatio.fillTransaction()

// $ExpectType void
feeDelegatedSmartContractExecutionWithRatio.validateOptionalValues()

// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.type
// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.from
// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.nonce
// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.gas
// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.gasPrice
// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.chainId
// $ExpectType SignatureData[]
feeDelegatedSmartContractExecutionWithRatio.signatures
// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.to
// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.value
// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.input
// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.data
// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.feePayer
// $ExpectType SignatureData[]
feeDelegatedSmartContractExecutionWithRatio.feePayerSignatures
// $ExpectType string
feeDelegatedSmartContractExecutionWithRatio.feeRatio

const feeDelegatedCancelWithRatio = new FeeDelegatedCancelWithRatio({})

// $ExpectType string
feeDelegatedCancelWithRatio.getRLPEncoding()

// $ExpectType string
feeDelegatedCancelWithRatio.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancelWithRatio.sign('string')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancelWithRatio.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancelWithRatio.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancelWithRatio.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancelWithRatio.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancelWithRatio.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancelWithRatio.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancelWithRatio.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancelWithRatio.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancelWithRatio.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancelWithRatio.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancelWithRatio.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancelWithRatio.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancelWithRatio.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancelWithRatio.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedCancelWithRatio.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancelWithRatio.signAsFeePayer('string')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancelWithRatio.signAsFeePayer(keyrings.single)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancelWithRatio.signAsFeePayer(keyrings.multiple)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancelWithRatio.signAsFeePayer(keyrings.roleBased)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancelWithRatio.signAsFeePayer('string', 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancelWithRatio.signAsFeePayer(keyrings.single, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancelWithRatio.signAsFeePayer(keyrings.multiple, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancelWithRatio.signAsFeePayer(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancelWithRatio.signAsFeePayer('string', (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancelWithRatio.signAsFeePayer(keyrings.single, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancelWithRatio.signAsFeePayer(keyrings.multiple, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancelWithRatio.signAsFeePayer(keyrings.roleBased, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancelWithRatio.signAsFeePayer('string', 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancelWithRatio.signAsFeePayer(keyrings.single, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancelWithRatio.signAsFeePayer(keyrings.multiple, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedCancelWithRatio.signAsFeePayer(keyrings.roleBased, 0, (tx: AbstractFeeDelegatedTransaction) => '')

// $ExpectType void
feeDelegatedCancelWithRatio.appendSignatures(sig)
// $ExpectType void
feeDelegatedCancelWithRatio.appendSignatures([sig, sig])
// $ExpectType void
feeDelegatedCancelWithRatio.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedCancelWithRatio.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType void
feeDelegatedCancelWithRatio.appendFeePayerSignatures(sig)
// $ExpectType void
feeDelegatedCancelWithRatio.appendFeePayerSignatures([sig, sig])
// $ExpectType void
feeDelegatedCancelWithRatio.appendFeePayerSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedCancelWithRatio.appendFeePayerSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
feeDelegatedCancelWithRatio.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
feeDelegatedCancelWithRatio.getRawTransaction()

// $ExpectType string
feeDelegatedCancelWithRatio.getTransactionHash()

// $ExpectType string
feeDelegatedCancelWithRatio.getSenderTxHash()

// $ExpectType string
feeDelegatedCancelWithRatio.getRLPEncodingForSignature()

// $ExpectType string
feeDelegatedCancelWithRatio.getRLPEncodingForFeePayerSignature()

// $ExpectType string[]
feeDelegatedCancelWithRatio.recoverPublicKeys()

// $ExpectType string[]
feeDelegatedCancelWithRatio.recoverFeePayerPublicKeys()

// $ExpectType Promise<void>
feeDelegatedCancelWithRatio.fillTransaction()

// $ExpectType void
feeDelegatedCancelWithRatio.validateOptionalValues()

// $ExpectType string
feeDelegatedCancelWithRatio.type
// $ExpectType string
feeDelegatedCancelWithRatio.from
// $ExpectType string
feeDelegatedCancelWithRatio.nonce
// $ExpectType string
feeDelegatedCancelWithRatio.gas
// $ExpectType string
feeDelegatedCancelWithRatio.gasPrice
// $ExpectType string
feeDelegatedCancelWithRatio.chainId
// $ExpectType SignatureData[]
feeDelegatedCancelWithRatio.signatures
// $ExpectType string
feeDelegatedCancelWithRatio.feePayer
// $ExpectType SignatureData[]
feeDelegatedCancelWithRatio.feePayerSignatures
// $ExpectType string
feeDelegatedCancelWithRatio.feeRatio

const feeDelegatedChainDataAnchoringWithRatio = new FeeDelegatedChainDataAnchoringWithRatio({})

// $ExpectType string
feeDelegatedChainDataAnchoringWithRatio.getRLPEncoding()

// $ExpectType string
feeDelegatedChainDataAnchoringWithRatio.getCommonRLPEncodingForSignature()

// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoringWithRatio.sign('string')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoringWithRatio.sign(keyrings.single)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoringWithRatio.sign(keyrings.multiple)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoringWithRatio.sign(keyrings.roleBased)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoringWithRatio.sign('string', 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoringWithRatio.sign(keyrings.single, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoringWithRatio.sign(keyrings.multiple, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoringWithRatio.sign(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoringWithRatio.sign('string', (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoringWithRatio.sign(keyrings.single, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoringWithRatio.sign(keyrings.multiple, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoringWithRatio.sign(keyrings.roleBased, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoringWithRatio.sign('string', 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoringWithRatio.sign(keyrings.single, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoringWithRatio.sign(keyrings.multiple, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
feeDelegatedChainDataAnchoringWithRatio.sign(keyrings.roleBased, 0, (tx: AbstractTransaction) => '')

// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoringWithRatio.signAsFeePayer('string')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoringWithRatio.signAsFeePayer(keyrings.single)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoringWithRatio.signAsFeePayer(keyrings.multiple)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoringWithRatio.signAsFeePayer(keyrings.roleBased)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoringWithRatio.signAsFeePayer('string', 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoringWithRatio.signAsFeePayer(keyrings.single, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoringWithRatio.signAsFeePayer(keyrings.multiple, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoringWithRatio.signAsFeePayer(keyrings.roleBased, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoringWithRatio.signAsFeePayer('string', (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoringWithRatio.signAsFeePayer(keyrings.single, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoringWithRatio.signAsFeePayer(keyrings.multiple, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoringWithRatio.signAsFeePayer(keyrings.roleBased, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoringWithRatio.signAsFeePayer('string', 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoringWithRatio.signAsFeePayer(keyrings.single, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoringWithRatio.signAsFeePayer(keyrings.multiple, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
feeDelegatedChainDataAnchoringWithRatio.signAsFeePayer(keyrings.roleBased, 0, (tx: AbstractFeeDelegatedTransaction) => '')

// $ExpectType void
feeDelegatedChainDataAnchoringWithRatio.appendSignatures(sig)
// $ExpectType void
feeDelegatedChainDataAnchoringWithRatio.appendSignatures([sig, sig])
// $ExpectType void
feeDelegatedChainDataAnchoringWithRatio.appendSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedChainDataAnchoringWithRatio.appendSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType void
feeDelegatedChainDataAnchoringWithRatio.appendFeePayerSignatures(sig)
// $ExpectType void
feeDelegatedChainDataAnchoringWithRatio.appendFeePayerSignatures([sig, sig])
// $ExpectType void
feeDelegatedChainDataAnchoringWithRatio.appendFeePayerSignatures(['0x01', '0x', '0x'])
// $ExpectType void
feeDelegatedChainDataAnchoringWithRatio.appendFeePayerSignatures([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])

// $ExpectType string
feeDelegatedChainDataAnchoringWithRatio.combineSignedRawTransactions(['rlpEncoded1', 'rlpEncoded2'])

// $ExpectType string
feeDelegatedChainDataAnchoringWithRatio.getRawTransaction()

// $ExpectType string
feeDelegatedChainDataAnchoringWithRatio.getTransactionHash()

// $ExpectType string
feeDelegatedChainDataAnchoringWithRatio.getSenderTxHash()

// $ExpectType string
feeDelegatedChainDataAnchoringWithRatio.getRLPEncodingForSignature()

// $ExpectType string
feeDelegatedChainDataAnchoringWithRatio.getRLPEncodingForFeePayerSignature()

// $ExpectType string[]
feeDelegatedChainDataAnchoringWithRatio.recoverPublicKeys()

// $ExpectType string[]
feeDelegatedChainDataAnchoringWithRatio.recoverFeePayerPublicKeys()

// $ExpectType Promise<void>
feeDelegatedChainDataAnchoringWithRatio.fillTransaction()

// $ExpectType void
feeDelegatedChainDataAnchoringWithRatio.validateOptionalValues()

// $ExpectType string
feeDelegatedChainDataAnchoringWithRatio.type
// $ExpectType string
feeDelegatedChainDataAnchoringWithRatio.from
// $ExpectType string
feeDelegatedChainDataAnchoringWithRatio.nonce
// $ExpectType string
feeDelegatedChainDataAnchoringWithRatio.gas
// $ExpectType string
feeDelegatedChainDataAnchoringWithRatio.gasPrice
// $ExpectType string
feeDelegatedChainDataAnchoringWithRatio.chainId
// $ExpectType SignatureData[]
feeDelegatedChainDataAnchoringWithRatio.signatures
// $ExpectType string
feeDelegatedChainDataAnchoringWithRatio.input
// $ExpectType string
feeDelegatedChainDataAnchoringWithRatio.feePayer
// $ExpectType SignatureData[]
feeDelegatedChainDataAnchoringWithRatio.feePayerSignatures
// $ExpectType string
feeDelegatedChainDataAnchoringWithRatio.feeRatio
