/*
    Copyright 2022 The caver-js Authors
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

import { CreateTransactionObject } from '../abstractTransaction'
import { AccountUpdate } from '../accountUpdate/accountUpdate'
import { FeeDelegatedAccountUpdate } from '../accountUpdate/feeDelegatedAccountUpdate'
import { FeeDelegatedAccountUpdateWithRatio } from '../accountUpdate/feeDelegatedAccountUpdateWithRatio'
import { Cancel } from '../cancel/cancel'
import { FeeDelegatedCancel } from '../cancel/feeDelegatedCancel'
import { FeeDelegatedCancelWithRatio } from '../cancel/feeDelegatedCancelWithRatio'
import { ChainDataAnchoring } from '../chainDataAnchoring/chainDataAnchoring'
import { FeeDelegatedChainDataAnchoring } from '../chainDataAnchoring/feeDelegatedChainDataAnchoring'
import { FeeDelegatedChainDataAnchoringWithRatio } from '../chainDataAnchoring/feeDelegatedChainDataAnchoringWithRatio'
import { EthereumAccessList } from '../ethereumTypedTransaction/ethereumAccessList'
import { EthereumDynamicFee } from '../ethereumTypedTransaction/ethereumDynamicFee'
import { LegacyTransaction } from '../legacyTransaction/legacyTransaction'
import { FeeDelegatedSmartContractDeploy } from '../smartContractDeploy/feeDelegatedSmartContractDeploy'
import { FeeDelegatedSmartContractDeployWithRatio } from '../smartContractDeploy/feeDelegatedSmartContractDeployWithRatio'
import { SmartContractDeploy } from '../smartContractDeploy/smartContractDeploy'
import { FeeDelegatedSmartContractExecution } from '../smartContractExecution/feeDelegatedSmartContractExecution'
import { FeeDelegatedSmartContractExecutionWithRatio } from '../smartContractExecution/feeDelegatedSmartContractExecutionWithRatio'
import { SmartContractExecution } from '../smartContractExecution/smartContractExecution'
import { FeeDelegatedValueTransfer } from '../valueTransfer/feeDelegatedValueTransfer'
import { FeeDelegatedValueTransferWithRatio } from '../valueTransfer/feeDelegatedValueTransferWithRatio'
import { ValueTransfer } from '../valueTransfer/valueTransfer'
import { FeeDelegatedValueTransferMemo } from '../valueTransferMemo/feeDelegatedValueTransferMemo'
import { FeeDelegatedValueTransferMemoWithRatio } from '../valueTransferMemo/feeDelegatedValueTransferMemoWithRatio'
import { ValueTransferMemo } from '../valueTransferMemo/valueTransferMemo'
import { KlaytnCall } from '../../../../caver-rpc/src/klay'

export class AccountUpdateWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): AccountUpdate
    decode(encoded: string): AccountUpdate
}

export class FeeDelegatedAccountUpdateWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): FeeDelegatedAccountUpdate
    decode(encoded: string): FeeDelegatedAccountUpdate
}

export class FeeDelegatedAccountUpdateWithRatioWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): FeeDelegatedAccountUpdateWithRatio
    decode(encoded: string): FeeDelegatedAccountUpdateWithRatio
}

export class CancelWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): Cancel
    decode(encoded: string): Cancel
}

export class FeeDelegatedCancelWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): FeeDelegatedCancel
    decode(encoded: string): FeeDelegatedCancel
}

export class FeeDelegatedCancelWithRatioWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): FeeDelegatedCancelWithRatio
    decode(encoded: string): FeeDelegatedCancelWithRatio
}

export class ChainDataAnchoringWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): ChainDataAnchoring
    decode(encoded: string): ChainDataAnchoring
}

export class FeeDelegatedChainDataAnchoringWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): FeeDelegatedChainDataAnchoring
    decode(encoded: string): FeeDelegatedChainDataAnchoring
}

export class FeeDelegatedChainDataAnchoringWithRatioWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): FeeDelegatedChainDataAnchoringWithRatio
    decode(encoded: string): FeeDelegatedChainDataAnchoringWithRatio
}

export class EthereumAccessListWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): EthereumAccessList
    decode(encoded: string): EthereumAccessList
}

export class EthereumDynamicFeeWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): EthereumDynamicFee
    decode(encoded: string): EthereumDynamicFee
}

export class LegacyTransactionWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): LegacyTransaction
    decode(encoded: string): LegacyTransaction
}

export class FeeDelegatedSmartContractDeployWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): FeeDelegatedSmartContractDeploy
    decode(encoded: string): FeeDelegatedSmartContractDeploy
}

export class FeeDelegatedSmartContractDeployWithRatioWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): FeeDelegatedSmartContractDeployWithRatio
    decode(encoded: string): FeeDelegatedSmartContractDeployWithRatio
}

export class SmartContractDeployWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): SmartContractDeploy
    decode(encoded: string): SmartContractDeploy
}

export class FeeDelegatedSmartContractExecutionWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): FeeDelegatedSmartContractExecution
    decode(encoded: string): FeeDelegatedSmartContractExecution
}

export class FeeDelegatedSmartContractExecutionWithRatioWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): FeeDelegatedSmartContractExecutionWithRatio
    decode(encoded: string): FeeDelegatedSmartContractExecutionWithRatio
}

export class SmartContractExecutionWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): SmartContractExecution
    decode(encoded: string): SmartContractExecution
}

export class FeeDelegatedValueTransferWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): FeeDelegatedValueTransfer
    decode(encoded: string): FeeDelegatedValueTransfer
}

export class FeeDelegatedValueTransferWithRatioWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): FeeDelegatedValueTransferWithRatio
    decode(encoded: string): FeeDelegatedValueTransferWithRatio
}

export class ValueTransferWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): ValueTransfer
    decode(encoded: string): ValueTransfer
}

export class FeeDelegatedValueTransferMemoWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): FeeDelegatedValueTransferMemo
    decode(encoded: string): FeeDelegatedValueTransferMemo
}

export class FeeDelegatedValueTransferMemoWithRatioWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): FeeDelegatedValueTransferMemoWithRatio
    decode(encoded: string): FeeDelegatedValueTransferMemoWithRatio
}

export class ValueTransferMemoWrapper {
    constructor(klaytnCall: KlaytnCall)

    create(obj: CreateTransactionObject): ValueTransferMemo
    decode(encoded: string): ValueTransferMemo
}
