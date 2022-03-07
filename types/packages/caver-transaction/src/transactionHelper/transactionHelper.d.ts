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

export namespace TX_TYPE_STRING {
    const TxTypeLegacyTransaction: string

    const TxTypeValueTransfer: string
    const TxTypeFeeDelegatedValueTransfer: string
    const TxTypeFeeDelegatedValueTransferWithRatio: string

    const TxTypeValueTransferMemo: string
    const TxTypeFeeDelegatedValueTransferMemo: string
    const TxTypeFeeDelegatedValueTransferMemoWithRatio: string

    const TxTypeAccountUpdate: string
    const TxTypeFeeDelegatedAccountUpdate: string
    const TxTypeFeeDelegatedAccountUpdateWithRatio: string

    const TxTypeSmartContractDeploy: string
    const TxTypeFeeDelegatedSmartContractDeploy: string
    const TxTypeFeeDelegatedSmartContractDeployWithRatio: string

    const TxTypeSmartContractExecution: string
    const TxTypeFeeDelegatedSmartContractExecution: string
    const TxTypeFeeDelegatedSmartContractExecutionWithRatio: string

    const TxTypeCancel: string
    const TxTypeFeeDelegatedCancel: string
    const TxTypeFeeDelegatedCancelWithRatio: string

    const TxTypeChainDataAnchoring: string
    const TxTypeFeeDelegatedChainDataAnchoring: string
    const TxTypeFeeDelegatedChainDataAnchoringWithRatio: string

    const TxTypeEthereumAccessList: string
    const TxTypeEthereumDynamicFee: string
}

export const TX_TYPE_TAG: { [key: string]: string }

export namespace CODE_FORMAT {
    const EVM: string
}
