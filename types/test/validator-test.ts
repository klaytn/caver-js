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
    Validator,
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
    SignatureData,
} from 'caver-js'

const caver = new Caver()

// $ExpectType Validator
caver.validator

// $ExpectType Validator
const validator = new Validator(caver.rpc.klay.klaytnCall)

// $ExpectType KlaytnCall
validator.klaytnCall

const sig = new SignatureData(['0x01', '0x', '0x'])

// $ExpectType Promise<boolean>
validator.validateSignedMessage('message', ['0x01', '0x', '0x'], 'address')
// $ExpectType Promise<boolean>
validator.validateSignedMessage('message', ['0x01', '0x', '0x'], 'address', false)
// $ExpectType Promise<boolean>
validator.validateSignedMessage('message', [['0x01', '0x', '0x']], 'address')
// $ExpectType Promise<boolean>
validator.validateSignedMessage('message', [['0x01', '0x', '0x']], 'address', false)
// $ExpectType Promise<boolean>
validator.validateSignedMessage('message', sig, 'address')
// $ExpectType Promise<boolean>
validator.validateSignedMessage('message', sig, 'address', false)
// $ExpectType Promise<boolean>
validator.validateSignedMessage('message', [sig], 'address')
// $ExpectType Promise<boolean>
validator.validateSignedMessage('message', [sig], 'address', false)

const txs = {
    legacy: new LegacyTransaction({}),
    vt: new ValueTransfer({}),
    fdvt: new FeeDelegatedValueTransfer({}),
    fdrvt: new FeeDelegatedValueTransferWithRatio({}),
    vtm: new ValueTransferMemo({}),
    fdvtm: new FeeDelegatedValueTransferMemo({}),
    fdrvtm: new FeeDelegatedValueTransferMemoWithRatio({}),
    update: new AccountUpdate({}),
    fdupdate: new FeeDelegatedAccountUpdate({}),
    fdrupdate: new FeeDelegatedAccountUpdateWithRatio({}),
    deploy: new SmartContractDeploy({}),
    fddeploy: new FeeDelegatedSmartContractDeploy({}),
    fdrdeploy: new FeeDelegatedSmartContractDeployWithRatio({}),
    exe: new SmartContractExecution({}),
    fdexe: new FeeDelegatedSmartContractExecution({}),
    fdrexe: new FeeDelegatedSmartContractExecutionWithRatio({}),
    cancel: new Cancel({}),
    fdcancel: new FeeDelegatedCancel({}),
    fdrcancel: new FeeDelegatedCancelWithRatio({}),
    anchor: new ChainDataAnchoring({}),
    fdanchor: new FeeDelegatedChainDataAnchoring({}),
    fdranchor: new FeeDelegatedChainDataAnchoringWithRatio({}),
}

// $ExpectType Promise<boolean>
validator.validateTransaction(txs.legacy)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.vt)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.fdvt)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.fdrvt)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.vtm)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.fdvtm)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.fdrvtm)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.update)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.fdupdate)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.fdrupdate)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.deploy)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.fddeploy)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.fdrdeploy)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.exe)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.fdexe)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.fdrexe)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.cancel)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.fdcancel)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.fdrcancel)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.anchor)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.fdanchor)
// $ExpectType Promise<boolean>
validator.validateTransaction(txs.fdranchor)

// $ExpectType Promise<boolean>
validator.validateSender(txs.legacy)
// $ExpectType Promise<boolean>
validator.validateSender(txs.vt)
// $ExpectType Promise<boolean>
validator.validateSender(txs.fdvt)
// $ExpectType Promise<boolean>
validator.validateSender(txs.fdrvt)
// $ExpectType Promise<boolean>
validator.validateSender(txs.vtm)
// $ExpectType Promise<boolean>
validator.validateSender(txs.fdvtm)
// $ExpectType Promise<boolean>
validator.validateSender(txs.fdrvtm)
// $ExpectType Promise<boolean>
validator.validateSender(txs.update)
// $ExpectType Promise<boolean>
validator.validateSender(txs.fdupdate)
// $ExpectType Promise<boolean>
validator.validateSender(txs.fdrupdate)
// $ExpectType Promise<boolean>
validator.validateSender(txs.deploy)
// $ExpectType Promise<boolean>
validator.validateSender(txs.fddeploy)
// $ExpectType Promise<boolean>
validator.validateSender(txs.fdrdeploy)
// $ExpectType Promise<boolean>
validator.validateSender(txs.exe)
// $ExpectType Promise<boolean>
validator.validateSender(txs.fdexe)
// $ExpectType Promise<boolean>
validator.validateSender(txs.fdrexe)
// $ExpectType Promise<boolean>
validator.validateSender(txs.cancel)
// $ExpectType Promise<boolean>
validator.validateSender(txs.fdcancel)
// $ExpectType Promise<boolean>
validator.validateSender(txs.fdrcancel)
// $ExpectType Promise<boolean>
validator.validateSender(txs.anchor)
// $ExpectType Promise<boolean>
validator.validateSender(txs.fdanchor)
// $ExpectType Promise<boolean>
validator.validateSender(txs.fdranchor)

// $ExpectType Promise<boolean>
validator.validateFeePayer(txs.fdvt)
// $ExpectType Promise<boolean>
validator.validateFeePayer(txs.fdrvt)
// $ExpectType Promise<boolean>
validator.validateFeePayer(txs.fdvtm)
// $ExpectType Promise<boolean>
validator.validateFeePayer(txs.fdrvtm)
// $ExpectType Promise<boolean>
validator.validateFeePayer(txs.fdupdate)
// $ExpectType Promise<boolean>
validator.validateFeePayer(txs.fdrupdate)
// $ExpectType Promise<boolean>
validator.validateFeePayer(txs.fddeploy)
// $ExpectType Promise<boolean>
validator.validateFeePayer(txs.fdrdeploy)
// $ExpectType Promise<boolean>
validator.validateFeePayer(txs.fdexe)
// $ExpectType Promise<boolean>
validator.validateFeePayer(txs.fdrexe)
// $ExpectType Promise<boolean>
validator.validateFeePayer(txs.fdcancel)
// $ExpectType Promise<boolean>
validator.validateFeePayer(txs.fdrcancel)
// $ExpectType Promise<boolean>
validator.validateFeePayer(txs.fdanchor)
// $ExpectType Promise<boolean>
validator.validateFeePayer(txs.fdranchor)
