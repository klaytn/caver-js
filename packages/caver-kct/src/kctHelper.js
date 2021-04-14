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

const _ = require('lodash')
const BigNumber = require('bignumber.js')
const { isBigNumber } = require('../../caver-utils')

async function determineSendParams(executableObj, sendParam, options) {
    let sendOptions = {}
    sendOptions = Object.assign(sendOptions, options)
    sendOptions = Object.assign(sendOptions, sendParam)
    const { from, gas, feeDelegation, feePayer, feeRatio } = sendOptions
    if (!from)
        throw new Error(
            `'from' is missing. Please pass the sender's address in sendParam.from or define default sender address at 'kctContract.options.from'.`
        )

    if (gas === undefined) {
        const estimated = await executableObj.estimateGas({ from })
        const originalGas = new BigNumber(estimated, 10)
        const bufferGas = new BigNumber(1.7, 10)

        sendOptions.gas = Math.round(originalGas.times(bufferGas))
    }

    if (feeDelegation === undefined && (feePayer || feeRatio !== undefined)) {
        throw new Error('To use fee delegation with KCT, please set `feeDelegation` field to true.')
    }

    return sendOptions
}

function formatParamForUint256(param) {
    return convertToNumberString(param)
}

function convertToNumberString(value) {
    if (!isBigNumber(value) && !_.isNumber(value) && !_.isString(value)) throw new Error(`unsupported type`)

    const bn = new BigNumber(value)
    const numberString = bn.toString(10)

    if (numberString === 'NaN') throw new Error(`invalid parameter value`)

    return numberString
}

const errForDeployParamValidation = 'Failed to validate token info for deploy: '

function _validateCommonParam(obj) {
    if (!obj.name || !_.isString(obj.name)) throw new Error(`${errForDeployParamValidation}Invalid name of token`)
    if (!obj.symbol || !_.isString(obj.symbol)) throw new Error(`${errForDeployParamValidation}Invalid symbol of token`)
}

function validateDeployParameterForKIP7(obj) {
    _validateCommonParam(obj)

    if (obj.decimals === undefined || !_.isNumber(obj.decimals)) throw new Error(`${errForDeployParamValidation}Invalid decimals of token`)

    try {
        if (obj.initialSupply === undefined) {
            throw new Error(`Invalid initialSupply of token: ${obj.initialSupply}`)
        } else {
            obj.initialSupply = convertToNumberString(obj.initialSupply)
        }
    } catch (e) {
        // Catch the error here to add more details to the error message.
        throw new Error(`${errForDeployParamValidation}${e.message}`)
    }
}

function validateDeployParameterForKIP17(obj) {
    _validateCommonParam(obj)
}

function validateDeployParameterForKIP37(obj) {
    if (!obj.uri || !_.isString(obj.uri)) throw new Error(`${errForDeployParamValidation}Invalid uri of token`)
}

// KIP-7 token contract source code
// https://github.com/klaytn/klaytn-contracts/tree/master/contracts/token/KIP7/KIP7Token.sol
// The ABI and bytecode below are built via the following command.
// solc --abi --bin --allow-paths . klaytn-contracts/contracts/token/KIP7/KIP7Token.sol
const kip7JsonInterface = [
    {
        constant: true,
        inputs: [{ name: 'interfaceId', type: 'bytes4' }],
        name: 'supportsInterface',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'name',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }],
        name: 'approve',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'totalSupply',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }],
        name: 'transferFrom',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint8' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'unpause', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: false,
        inputs: [{ name: 'account', type: 'address' }, { name: 'amount', type: 'uint256' }],
        name: 'mint',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'recipient', type: 'address' }, { name: 'amount', type: 'uint256' }],
        name: 'safeTransfer',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'sender', type: 'address' }, { name: 'recipient', type: 'address' }, { name: 'amount', type: 'uint256' }],
        name: 'safeTransferFrom',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'amount', type: 'uint256' }],
        name: 'burn',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'isPauser',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'paused',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'renouncePauser', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: true,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'account', type: 'address' }, { name: 'amount', type: 'uint256' }],
        name: 'burnFrom',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'addPauser',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'pause', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: true,
        inputs: [],
        name: 'symbol',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'addMinter',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'renounceMinter', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: false,
        inputs: [{ name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }],
        name: 'transfer',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'isMinter',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            { name: 'sender', type: 'address' },
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'data', type: 'bytes' },
        ],
        name: 'safeTransferFrom',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
        name: 'allowance',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'recipient', type: 'address' }, { name: 'amount', type: 'uint256' }, { name: 'data', type: 'bytes' }],
        name: 'safeTransfer',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: 'name', type: 'string' },
            { name: 'symbol', type: 'string' },
            { name: 'decimals', type: 'uint8' },
            { name: 'initialSupply', type: 'uint256' },
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    { anonymous: false, inputs: [{ indexed: false, name: 'account', type: 'address' }], name: 'Paused', type: 'event' },
    { anonymous: false, inputs: [{ indexed: false, name: 'account', type: 'address' }], name: 'Unpaused', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'PauserAdded', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'PauserRemoved', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'MinterAdded', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'MinterRemoved', type: 'event' },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'from', type: 'address' },
            { indexed: true, name: 'to', type: 'address' },
            { indexed: false, name: 'value', type: 'uint256' },
        ],
        name: 'Transfer',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'owner', type: 'address' },
            { indexed: true, name: 'spender', type: 'address' },
            { indexed: false, name: 'value', type: 'uint256' },
        ],
        name: 'Approval',
        type: 'event',
    },
]

// KIP-7 token contract source code
// https://github.com/klaytn/klaytn-contracts/tree/master/contracts/token/KIP7/KIP7Token.sol
const kip7ByteCode =
    '60806040523480156200001157600080fd5b5060405162002f8438038062002f84833981018060405260808110156200003757600080fd5b8101908080516401000000008111156200005057600080fd5b828101905060208101848111156200006757600080fd5b81518560018202830111640100000000821117156200008557600080fd5b50509291906020018051640100000000811115620000a257600080fd5b82810190506020810184811115620000b957600080fd5b8151856001820283011164010000000082111715620000d757600080fd5b50509291906020018051906020019092919080519060200190929190505050838383620001116301ffc9a760e01b6200023260201b60201c565b62000129636578737160e01b6200023260201b60201c565b6200013a336200033b60201b60201c565b6200015263eab83e2060e01b6200023260201b60201c565b6200016a633b5a0bf860e01b6200023260201b60201c565b6200017b336200039c60201b60201c565b6000600660006101000a81548160ff021916908315150217905550620001ae634d5507ff60e01b6200023260201b60201c565b8260079080519060200190620001c692919062000816565b508160089080519060200190620001df92919062000816565b5080600960006101000a81548160ff021916908360ff1602179055506200021363a219a02560e01b6200023260201b60201c565b505050620002283382620003fd60201b60201c565b50505050620008c5565b63ffffffff60e01b817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161415620002cf576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f4b495031333a20696e76616c696420696e74657266616365206964000000000081525060200191505060405180910390fd5b6001600080837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b62000356816004620005c960201b620024181790919060201c565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b620003b7816005620005c960201b620024181790919060201c565b8073ffffffffffffffffffffffffffffffffffffffff167f6719d08c1888103bea251a4ed56406bd0c3e69723c8a1686e017e7bbe159b6f860405160405180910390a250565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415620004a1576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f4b4950373a206d696e7420746f20746865207a65726f2061646472657373000081525060200191505060405180910390fd5b620004bd81600354620006ad60201b620022d31790919060201c565b6003819055506200051c81600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054620006ad60201b620022d31790919060201c565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b620005db82826200073660201b60201c565b156200064f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b6000808284019050838110156200072c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415620007bf576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602281526020018062002f626022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200085957805160ff19168380011785556200088a565b828001600101855582156200088a579182015b82811115620008895782518255916020019190600101906200086c565b5b5090506200089991906200089d565b5090565b620008c291905b80821115620008be576000816000905550600101620008a4565b5090565b90565b61268d80620008d56000396000f3fe608060405234801561001057600080fd5b506004361061018e5760003560e01c80636ef8d66d116100de578063983b2d5611610097578063aa271e1a11610071578063aa271e1a146107b6578063b88d4fde14610812578063dd62ed3e14610917578063eb7955491461098f5761018e565b8063983b2d56146107025780639865027514610746578063a9059cbb146107505761018e565b80636ef8d66d1461058157806370a082311461058b57806379cc6790146105e357806382dc1ec4146106315780638456cb591461067557806395d89b411461067f5761018e565b80633f4ba83a1161014b57806342842e0e1161012557806342842e0e1461046757806342966c68146104d557806346fbf68e146105035780635c975abb1461055f5761018e565b80633f4ba83a146103a957806340c10f19146103b3578063423f6cef146104195761018e565b806301ffc9a71461019357806306fdde03146101f8578063095ea7b31461027b57806318160ddd146102e157806323b872dd146102ff578063313ce56714610385575b600080fd5b6101de600480360360208110156101a957600080fd5b8101908080357bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19169060200190929190505050610a74565b604051808215151515815260200191505060405180910390f35b610200610adb565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610240578082015181840152602081019050610225565b50505050905090810190601f16801561026d5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102c76004803603604081101561029157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610b7d565b604051808215151515815260200191505060405180910390f35b6102e9610c14565b6040518082815260200191505060405180910390f35b61036b6004803603606081101561031557600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610c1e565b604051808215151515815260200191505060405180910390f35b61038d610cb7565b604051808260ff1660ff16815260200191505060405180910390f35b6103b1610cce565b005b6103ff600480360360408110156103c957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610e2e565b604051808215151515815260200191505060405180910390f35b6104656004803603604081101561042f57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610ea2565b005b6104d36004803603606081101561047d57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610ec0565b005b610501600480360360208110156104eb57600080fd5b8101908080359060200190929190505050610ee0565b005b6105456004803603602081101561051957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610eed565b604051808215151515815260200191505060405180910390f35b610567610f0a565b604051808215151515815260200191505060405180910390f35b610589610f21565b005b6105cd600480360360208110156105a157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610f2c565b6040518082815260200191505060405180910390f35b61062f600480360360408110156105f957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610f75565b005b6106736004803603602081101561064757600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610f83565b005b61067d610fed565b005b61068761114e565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156106c75780820151818401526020810190506106ac565b50505050905090810190601f1680156106f45780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6107446004803603602081101561071857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506111f0565b005b61074e61125a565b005b61079c6004803603604081101561076657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050611265565b604051808215151515815260200191505060405180910390f35b6107f8600480360360208110156107cc57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506112fc565b604051808215151515815260200191505060405180910390f35b6109156004803603608081101561082857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291908035906020019064010000000081111561088f57600080fd5b8201836020820111156108a157600080fd5b803590602001918460018302840111640100000000831117156108c357600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611319565b005b6109796004803603604081101561092d57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061138c565b6040518082815260200191505060405180910390f35b610a72600480360360608110156109a557600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156109ec57600080fd5b8201836020820111156109fe57600080fd5b80359060200191846001830284011164010000000083111715610a2057600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611413565b005b6000806000837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060009054906101000a900460ff169050919050565b606060078054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610b735780601f10610b4857610100808354040283529160200191610b73565b820191906000526020600020905b815481529060010190602001808311610b5657829003601f168201915b5050505050905090565b6000600660009054906101000a900460ff1615610c02576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b610c0c8383611484565b905092915050565b6000600354905090565b6000600660009054906101000a900460ff1615610ca3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b610cae84848461149b565b90509392505050565b6000600960009054906101000a900460ff16905090565b610cd733610eed565b610d2c576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806125566030913960400191505060405180910390fd5b600660009054906101000a900460ff16610dae576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f5061757361626c653a206e6f742070617573656400000000000000000000000081525060200191505060405180910390fd5b6000600660006101000a81548160ff0219169083151502179055507f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa33604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a1565b6000610e39336112fc565b610e8e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806125a86030913960400191505060405180910390fd5b610e98838361154c565b6001905092915050565b610ebc828260405180602001604052806000815250611413565b5050565b610edb83838360405180602001604052806000815250611319565b505050565b610eea3382611709565b50565b6000610f038260056118c690919063ffffffff16565b9050919050565b6000600660009054906101000a900460ff16905090565b610f2a336119a4565b565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b610f7f82826119fe565b5050565b610f8c33610eed565b610fe1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806125566030913960400191505060405180910390fd5b610fea81611aa5565b50565b610ff633610eed565b61104b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806125566030913960400191505060405180910390fd5b600660009054906101000a900460ff16156110ce576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b6001600660006101000a81548160ff0219169083151502179055507f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a25833604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a1565b606060088054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156111e65780601f106111bb576101008083540402835291602001916111e6565b820191906000526020600020905b8154815290600101906020018083116111c957829003601f168201915b5050505050905090565b6111f9336112fc565b61124e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806125a86030913960400191505060405180910390fd5b61125781611aff565b50565b61126333611b59565b565b6000600660009054906101000a900460ff16156112ea576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b6112f48383611bb3565b905092915050565b60006113128260046118c690919063ffffffff16565b9050919050565b611324848484610c1e565b5061133184848484611bca565b611386576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602e815260200180612528602e913960400191505060405180910390fd5b50505050565b6000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b61141d8383611265565b5061142a33848484611bca565b61147f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602e815260200180612528602e913960400191505060405180910390fd5b505050565b6000611491338484611db3565b6001905092915050565b60006114a8848484611faa565b611541843361153c85600260008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461224a90919063ffffffff16565b611db3565b600190509392505050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156115ef576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f4b4950373a206d696e7420746f20746865207a65726f2061646472657373000081525060200191505060405180910390fd5b611604816003546122d390919063ffffffff16565b60038190555061165c81600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546122d390919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156117ac576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f4b4950373a206275726e2066726f6d20746865207a65726f206164647265737381525060200191505060405180910390fd5b6117c18160035461224a90919063ffffffff16565b60038190555061181981600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461224a90919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141561194d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602281526020018061261d6022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b6119b881600561235b90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167fcd265ebaf09df2871cc7bd4133404a235ba12eff2041bb89d9c714a2621c7c7e60405160405180910390a250565b611a088282611709565b611aa18233611a9c84600260008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461224a90919063ffffffff16565b611db3565b5050565b611ab981600561241890919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167f6719d08c1888103bea251a4ed56406bd0c3e69723c8a1686e017e7bbe159b6f860405160405180910390a250565b611b1381600461241890919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b611b6d81600461235b90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167fe94479a9f7e1952cc78f2d6baab678adc1b772d936c6583def489e524cb6669260405160405180910390a250565b6000611bc0338484611faa565b6001905092915050565b6000611beb8473ffffffffffffffffffffffffffffffffffffffff166124f3565b611bf85760019050611dab565b60008473ffffffffffffffffffffffffffffffffffffffff16639d188c22338887876040518563ffffffff1660e01b8152600401808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b83811015611cd3578082015181840152602081019050611cb8565b50505050905090810190601f168015611d005780820380516001836020036101000a031916815260200191505b5095505050505050602060405180830381600087803b158015611d2257600080fd5b505af1158015611d36573d6000803e3d6000fd5b505050506040513d6020811015611d4c57600080fd5b81019080805190602001909291905050509050639d188c2260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916149150505b949350505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415611e39576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602381526020018061263f6023913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611ebf576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260218152602001806125076021913960400191505060405180910390fd5b80600260008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925836040518082815260200191505060405180910390a3505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415612030576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001806125f96024913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156120b6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806125866022913960400191505060405180910390fd5b61210881600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461224a90919063ffffffff16565b600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555061219d81600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546122d390919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a3505050565b6000828211156122c2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f536166654d6174683a207375627472616374696f6e206f766572666c6f77000081525060200191505060405180910390fd5b600082840390508091505092915050565b600080828401905083811015612351576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b61236582826118c6565b6123ba576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260218152602001806125d86021913960400191505060405180910390fd5b60008260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b61242282826118c6565b15612495576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b600080823b90506000811191505091905056fe4b4950373a20617070726f766520746f20746865207a65726f20616464726573734b4950373a207472616e7366657220746f206e6f6e204b495037526563656976657220696d706c656d656e746572506175736572526f6c653a2063616c6c657220646f6573206e6f742068617665207468652050617573657220726f6c654b4950373a207472616e7366657220746f20746865207a65726f20616464726573734d696e746572526f6c653a2063616c6c657220646f6573206e6f74206861766520746865204d696e74657220726f6c65526f6c65733a206163636f756e7420646f6573206e6f74206861766520726f6c654b4950373a207472616e736665722066726f6d20746865207a65726f2061646472657373526f6c65733a206163636f756e7420697320746865207a65726f20616464726573734b4950373a20617070726f76652066726f6d20746865207a65726f2061646472657373a165627a7a72305820e51fab94e7709d70e4b7ff4aaaf6428d983cfa2bbfb4be772ec2de87ea0a2b9f0029526f6c65733a206163636f756e7420697320746865207a65726f2061646472657373'

// KIP-17 token contract source code
// https://github.com/klaytn/klaytn-contracts/tree/master/contracts/token/KIP17/KIP17Token.sol
// The ABI and bytecode below are built via the following command.
// solc --abi --bin --allow-paths . klaytn-contracts/contracts/token/KIP17/KIP17Token.sol
const kip17JsonInterface = [
    {
        constant: true,
        inputs: [{ name: 'interfaceId', type: 'bytes4' }],
        name: 'supportsInterface',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'name',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        name: 'getApproved',
        outputs: [{ name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }],
        name: 'approve',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'totalSupply',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }],
        name: 'transferFrom',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'owner', type: 'address' }, { name: 'index', type: 'uint256' }],
        name: 'tokenOfOwnerByIndex',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'unpause', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: false,
        inputs: [{ name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }],
        name: 'mint',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }],
        name: 'safeTransferFrom',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        name: 'burn',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'isPauser',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'index', type: 'uint256' }],
        name: 'tokenByIndex',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }, { name: 'tokenURI', type: 'string' }],
        name: 'mintWithTokenURI',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'paused',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        name: 'ownerOf',
        outputs: [{ name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'renouncePauser', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: true,
        inputs: [{ name: 'owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'addPauser',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'pause', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: true,
        inputs: [],
        name: 'symbol',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'addMinter',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'renounceMinter', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: false,
        inputs: [{ name: 'to', type: 'address' }, { name: 'approved', type: 'bool' }],
        name: 'setApprovalForAll',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'isMinter',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'tokenId', type: 'uint256' },
            { name: '_data', type: 'bytes' },
        ],
        name: 'safeTransferFrom',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        name: 'tokenURI',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'owner', type: 'address' }, { name: 'operator', type: 'address' }],
        name: 'isApprovedForAll',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'name', type: 'string' }, { name: 'symbol', type: 'string' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    { anonymous: false, inputs: [{ indexed: false, name: 'account', type: 'address' }], name: 'Paused', type: 'event' },
    { anonymous: false, inputs: [{ indexed: false, name: 'account', type: 'address' }], name: 'Unpaused', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'PauserAdded', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'PauserRemoved', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'MinterAdded', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'MinterRemoved', type: 'event' },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'from', type: 'address' },
            { indexed: true, name: 'to', type: 'address' },
            { indexed: true, name: 'tokenId', type: 'uint256' },
        ],
        name: 'Transfer',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'owner', type: 'address' },
            { indexed: true, name: 'approved', type: 'address' },
            { indexed: true, name: 'tokenId', type: 'uint256' },
        ],
        name: 'Approval',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'owner', type: 'address' },
            { indexed: true, name: 'operator', type: 'address' },
            { indexed: false, name: 'approved', type: 'bool' },
        ],
        name: 'ApprovalForAll',
        type: 'event',
    },
]

// KIP-17 token contract source code
// https://github.com/klaytn/klaytn-contracts/tree/master/contracts/token/KIP17/KIP17Token.sol
const kip17ByteCode =
    '60806040523480156200001157600080fd5b506040516200409538038062004095833981018060405260408110156200003757600080fd5b8101908080516401000000008111156200005057600080fd5b828101905060208101848111156200006757600080fd5b81518560018202830111640100000000821117156200008557600080fd5b50509291906020018051640100000000811115620000a257600080fd5b82810190506020810184811115620000b957600080fd5b8151856001820283011164010000000082111715620000d757600080fd5b505092919050505081818181620000fb6301ffc9a760e01b6200021e60201b60201c565b620001136380ac58cd60e01b6200021e60201b60201c565b6200012b63780e9d6360e01b6200021e60201b60201c565b816009908051906020019062000143929190620005ad565b5080600a90805190602001906200015c929190620005ad565b5062000175635b5e139f60e01b6200021e60201b60201c565b505050506200018a336200032760201b60201c565b620001a263eab83e2060e01b6200021e60201b60201c565b620001ba63fac27f4660e01b6200021e60201b60201c565b620001d26342966c6860e01b6200021e60201b60201c565b620001e3336200038860201b60201c565b6000600e60006101000a81548160ff02191690831515021790555062000216634d5507ff60e01b6200021e60201b60201c565b50506200065c565b63ffffffff60e01b817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161415620002bb576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f4b495031333a20696e76616c696420696e74657266616365206964000000000081525060200191505060405180910390fd5b6001600080837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b6200034281600c620003e960201b62002cab1790919060201c565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b620003a381600d620003e960201b62002cab1790919060201c565b8073ffffffffffffffffffffffffffffffffffffffff167f6719d08c1888103bea251a4ed56406bd0c3e69723c8a1686e017e7bbe159b6f860405160405180910390a250565b620003fb8282620004cd60201b60201c565b156200046f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141562000556576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526022815260200180620040736022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10620005f057805160ff191683800117855562000621565b8280016001018555821562000621579182015b828111156200062057825182559160200191906001019062000603565b5b50905062000630919062000634565b5090565b6200065991905b80821115620006555760008160009055506001016200063b565b5090565b90565b613a07806200066c6000396000f3fe608060405234801561001057600080fd5b50600436106101c45760003560e01c80635c975abb116100f9578063983b2d5611610097578063aa271e1a11610071578063aa271e1a14610963578063b88d4fde146109bf578063c87b56dd14610ac4578063e985e9c514610b6b576101c4565b8063983b2d56146108c55780639865027514610909578063a22cb46514610913576101c4565b806370a08231116100d357806370a082311461079c57806382dc1ec4146107f45780638456cb591461083857806395d89b4114610842576101c4565b80635c975abb146107025780636352211e146107245780636ef8d66d14610792576101c4565b80633f4ba83a1161016657806342966c681161014057806342966c681461053957806346fbf68e146105675780634f6ccce7146105c357806350bb4e7f14610605576101c4565b80633f4ba83a1461045b57806340c10f191461046557806342842e0e146104cb576101c4565b8063095ea7b3116101a2578063095ea7b31461031f57806318160ddd1461036d57806323b872dd1461038b5780632f745c59146103f9576101c4565b806301ffc9a7146101c957806306fdde031461022e578063081812fc146102b1575b600080fd5b610214600480360360208110156101df57600080fd5b8101908080357bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19169060200190929190505050610be7565b604051808215151515815260200191505060405180910390f35b610236610c4e565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561027657808201518184015260208101905061025b565b50505050905090810190601f1680156102a35780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102dd600480360360208110156102c757600080fd5b8101908080359060200190929190505050610cf0565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b61036b6004803603604081101561033557600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610d8b565b005b610375610e1c565b6040518082815260200191505060405180910390f35b6103f7600480360360608110156103a157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610e29565b005b6104456004803603604081101561040f57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610ebc565b6040518082815260200191505060405180910390f35b610463610f7b565b005b6104b16004803603604081101561047b57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506110db565b604051808215151515815260200191505060405180910390f35b610537600480360360608110156104e157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019092919050505061114f565b005b6105656004803603602081101561054f57600080fd5b810190808035906020019092919050505061116f565b005b6105a96004803603602081101561057d57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506111da565b604051808215151515815260200191505060405180910390f35b6105ef600480360360208110156105d957600080fd5b81019080803590602001909291905050506111f7565b6040518082815260200191505060405180910390f35b6106e86004803603606081101561061b57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291908035906020019064010000000081111561066257600080fd5b82018360208201111561067457600080fd5b8035906020019184600183028401116401000000008311171561069657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611277565b604051808215151515815260200191505060405180910390f35b61070a6112f6565b604051808215151515815260200191505060405180910390f35b6107506004803603602081101561073a57600080fd5b810190808035906020019092919050505061130d565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b61079a6113d5565b005b6107de600480360360208110156107b257600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506113e0565b6040518082815260200191505060405180910390f35b6108366004803603602081101561080a57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506114b5565b005b61084061151f565b005b61084a611680565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561088a57808201518184015260208101905061086f565b50505050905090810190601f1680156108b75780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b610907600480360360208110156108db57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611722565b005b61091161178c565b005b6109616004803603604081101561092957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803515159060200190929190505050611797565b005b6109a56004803603602081101561097957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611828565b604051808215151515815260200191505060405180910390f35b610ac2600480360360808110156109d557600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019092919080359060200190640100000000811115610a3c57600080fd5b820183602082011115610a4e57600080fd5b80359060200191846001830284011164010000000083111715610a7057600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611845565b005b610af060048036036020811015610ada57600080fd5b81019080803590602001909291905050506118b7565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610b30578082015181840152602081019050610b15565b50505050905090810190601f168015610b5d5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b610bcd60048036036040811015610b8157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506119ca565b604051808215151515815260200191505060405180910390f35b6000806000837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060009054906101000a900460ff169050919050565b606060098054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610ce65780601f10610cbb57610100808354040283529160200191610ce6565b820191906000526020600020905b815481529060010190602001808311610cc957829003601f168201915b5050505050905090565b6000610cfb82611a5e565b610d50576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b81526020018061394f602b913960400191505060405180910390fd5b6002600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b600e60009054906101000a900460ff1615610e0e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b610e188282611ad0565b5050565b6000600780549050905090565b600e60009054906101000a900460ff1615610eac576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b610eb7838383611cc6565b505050565b6000610ec7836113e0565b8210610f1e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602a815260200180613730602a913960400191505060405180910390fd5b600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208281548110610f6857fe5b9060005260206000200154905092915050565b610f84336111da565b610fd9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806136dd6030913960400191505060405180910390fd5b600e60009054906101000a900460ff1661105b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f5061757361626c653a206e6f742070617573656400000000000000000000000081525060200191505060405180910390fd5b6000600e60006101000a81548160ff0219169083151502179055507f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa33604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a1565b60006110e633611828565b61113b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603081526020018061375a6030913960400191505060405180910390fd5b6111458383611d35565b6001905092915050565b61116a83838360405180602001604052806000815250611845565b505050565b6111793382611d56565b6111ce576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602f815260200180613880602f913960400191505060405180910390fd5b6111d781611e4a565b50565b60006111f082600d611e5f90919063ffffffff16565b9050919050565b6000611201610e1c565b8210611258576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b815260200180613900602b913960400191505060405180910390fd5b6007828154811061126557fe5b90600052602060002001549050919050565b600061128233611828565b6112d7576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603081526020018061375a6030913960400191505060405180910390fd5b6112e18484611d35565b6112eb8383611f3d565b600190509392505050565b6000600e60009054906101000a900460ff16905090565b6000806001600084815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156113cc576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260288152602001806137ab6028913960400191505060405180910390fd5b80915050919050565b6113de33611fc7565b565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611467576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260298152602001806138af6029913960400191505060405180910390fd5b6114ae600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020612021565b9050919050565b6114be336111da565b611513576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806136dd6030913960400191505060405180910390fd5b61151c8161202f565b50565b611528336111da565b61157d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806136dd6030913960400191505060405180910390fd5b600e60009054906101000a900460ff1615611600576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b6001600e60006101000a81548160ff0219169083151502179055507f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a25833604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a1565b6060600a8054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156117185780601f106116ed57610100808354040283529160200191611718565b820191906000526020600020905b8154815290600101906020018083116116fb57829003601f168201915b5050505050905090565b61172b33611828565b611780576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603081526020018061375a6030913960400191505060405180910390fd5b61178981612089565b50565b611795336120e3565b565b600e60009054906101000a900460ff161561181a576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b611824828261213d565b5050565b600061183e82600c611e5f90919063ffffffff16565b9050919050565b611850848484610e29565b61185c848484846122e0565b6118b1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806138506030913960400191505060405180910390fd5b50505050565b60606118c282611a5e565b611917576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602e8152602001806136af602e913960400191505060405180910390fd5b600b60008381526020019081526020016000208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156119be5780601f10611993576101008083540402835291602001916119be565b820191906000526020600020905b8154815290600101906020018083116119a157829003601f168201915b50505050509050919050565b6000600460008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b6000806001600084815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415915050919050565b6000611adb8261130d565b90508073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415611b7f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f4b495031373a20617070726f76616c20746f2063757272656e74206f776e657281525060200191505060405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161480611bbf5750611bbe81336119ca565b5b611c14576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603781526020018061397a6037913960400191505060405180910390fd5b826002600084815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550818373ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a4505050565b611cd03382611d56565b611d25576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806137fe6030913960400191505060405180910390fd5b611d30838383612842565b505050565b611d3f8282612866565b611d498282612a7e565b611d5281612b45565b5050565b6000611d6182611a5e565b611db6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b8152602001806139b1602b913960400191505060405180910390fd5b6000611dc18361130d565b90508073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161480611e3057508373ffffffffffffffffffffffffffffffffffffffff16611e1884610cf0565b73ffffffffffffffffffffffffffffffffffffffff16145b80611e415750611e4081856119ca565b5b91505092915050565b611e5c611e568261130d565b82612b91565b50565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611ee6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602281526020018061382e6022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b611f4682611a5e565b611f9b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b8152602001806137d3602b913960400191505060405180910390fd5b80600b60008481526020019081526020016000209080519060200190611fc2929190613595565b505050565b611fdb81600d612bee90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167fcd265ebaf09df2871cc7bd4133404a235ba12eff2041bb89d9c714a2621c7c7e60405160405180910390a250565b600081600001549050919050565b61204381600d612cab90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167f6719d08c1888103bea251a4ed56406bd0c3e69723c8a1686e017e7bbe159b6f860405160405180910390a250565b61209d81600c612cab90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b6120f781600c612bee90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167fe94479a9f7e1952cc78f2d6baab678adc1b772d936c6583def489e524cb6669260405160405180910390a250565b3373ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156121df576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260188152602001807f4b495031373a20617070726f766520746f2063616c6c6572000000000000000081525060200191505060405180910390fd5b80600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3183604051808215151515815260200191505060405180910390a35050565b60008060606123048673ffffffffffffffffffffffffffffffffffffffff16612d86565b6123135760019250505061283a565b8573ffffffffffffffffffffffffffffffffffffffff1663150b7a0260e01b33898888604051602401808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b838110156123e35780820151818401526020810190506123c8565b50505050905090810190601f1680156124105780820380516001836020036101000a031916815260200191505b5095505050505050604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518082805190602001908083835b602083106124a85780518252602082019150602081019050602083039250612485565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d806000811461250a576040519150601f19603f3d011682016040523d82523d6000602084013e61250f565b606091505b5080925081935050506000815114158015612593575063150b7a0260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191681806020019051602081101561256157600080fd5b81019080805190602001909291905050507bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b156125a35760019250505061283a565b8573ffffffffffffffffffffffffffffffffffffffff16636745782b60e01b33898888604051602401808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b83811015612673578082015181840152602081019050612658565b50505050905090810190601f1680156126a05780820380516001836020036101000a031916815260200191505b5095505050505050604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518082805190602001908083835b602083106127385780518252602082019150602081019050602083039250612715565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d806000811461279a576040519150601f19603f3d011682016040523d82523d6000602084013e61279f565b606091505b50809250819350505060008151141580156128235750636745782b60e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19168180602001905160208110156127f157600080fd5b81019080805190602001909291905050507bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b156128335760019250505061283a565b6000925050505b949350505050565b61284d838383612d99565b6128578382612ff4565b6128618282612a7e565b505050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415612909576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f4b495031373a206d696e7420746f20746865207a65726f20616464726573730081525060200191505060405180910390fd5b61291281611a5e565b15612985576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f4b495031373a20746f6b656e20616c7265616479206d696e746564000000000081525060200191505060405180910390fd5b816001600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550612a1e600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020613192565b808273ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a45050565b600560008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805490506006600083815260200190815260200160002081905550600560008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190806001815401808255809150509060018203906000526020600020016000909192909190915055505050565b6007805490506008600083815260200190815260200160002081905550600781908060018154018082558091505090600182039060005260206000200160009091929091909150555050565b612b9b82826131a8565b6000600b600083815260200190815260200160002080546001816001161561010002031660029004905014612bea57600b60008281526020019081526020016000206000612be99190613615565b5b5050565b612bf88282611e5f565b612c4d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602181526020018061378a6021913960400191505060405180910390fd5b60008260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b612cb58282611e5f565b15612d28576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b600080823b905060008111915050919050565b8273ffffffffffffffffffffffffffffffffffffffff16612db98261130d565b73ffffffffffffffffffffffffffffffffffffffff1614612e25576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260288152602001806138d86028913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415612eab576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602381526020018061370d6023913960400191505060405180910390fd5b612eb4816131e2565b612efb600360008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206132a0565b612f42600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020613192565b816001600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a4505050565b600061304c6001600560008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805490506132c390919063ffffffff16565b9050600060066000848152602001908152602001600020549050818114613139576000600560008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002083815481106130b957fe5b9060005260206000200154905080600560008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020838154811061311157fe5b9060005260206000200181905550816006600083815260200190815260200160002081905550505b600560008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002080548091906001900361318b919061365d565b5050505050565b6001816000016000828254019250508190555050565b6131b2828261334c565b6131bc8282612ff4565b600060066000838152602001908152602001600020819055506131de816134db565b5050565b600073ffffffffffffffffffffffffffffffffffffffff166002600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161461329d5760006002600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b50565b6132b8600182600001546132c390919063ffffffff16565b816000018190555050565b60008282111561333b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f536166654d6174683a207375627472616374696f6e206f766572666c6f77000081525060200191505060405180910390fd5b600082840390508091505092915050565b8173ffffffffffffffffffffffffffffffffffffffff1661336c8261130d565b73ffffffffffffffffffffffffffffffffffffffff16146133d8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602481526020018061392b6024913960400191505060405180910390fd5b6133e1816131e2565b613428600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206132a0565b60006001600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a45050565b60006134f660016007805490506132c390919063ffffffff16565b905060006008600084815260200190815260200160002054905060006007838154811061351f57fe5b90600052602060002001549050806007838154811061353a57fe5b90600052602060002001819055508160086000838152602001908152602001600020819055506007805480919060019003613575919061365d565b506000600860008681526020019081526020016000208190555050505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106135d657805160ff1916838001178555613604565b82800160010185558215613604579182015b828111156136035782518255916020019190600101906135e8565b5b5090506136119190613689565b5090565b50805460018160011615610100020316600290046000825580601f1061363b575061365a565b601f0160209004906000526020600020908101906136599190613689565b5b50565b815481835581811115613684578183600052602060002091820191016136839190613689565b5b505050565b6136ab91905b808211156136a757600081600090555060010161368f565b5090565b9056fe4b495031374d657461646174613a2055524920717565727920666f72206e6f6e6578697374656e7420746f6b656e506175736572526f6c653a2063616c6c657220646f6573206e6f742068617665207468652050617573657220726f6c654b495031373a207472616e7366657220746f20746865207a65726f20616464726573734b49503137456e756d657261626c653a206f776e657220696e646578206f7574206f6620626f756e64734d696e746572526f6c653a2063616c6c657220646f6573206e6f74206861766520746865204d696e74657220726f6c65526f6c65733a206163636f756e7420646f6573206e6f74206861766520726f6c654b495031373a206f776e657220717565727920666f72206e6f6e6578697374656e7420746f6b656e4b495031374d657461646174613a2055524920736574206f66206e6f6e6578697374656e7420746f6b656e4b495031373a207472616e736665722063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f766564526f6c65733a206163636f756e7420697320746865207a65726f20616464726573734b495031373a207472616e7366657220746f206e6f6e204b49503137526563656976657220696d706c656d656e7465724b495031374275726e61626c653a2063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f7665644b495031373a2062616c616e636520717565727920666f7220746865207a65726f20616464726573734b495031373a207472616e73666572206f6620746f6b656e2074686174206973206e6f74206f776e4b49503137456e756d657261626c653a20676c6f62616c20696e646578206f7574206f6620626f756e64734b495031373a206275726e206f6620746f6b656e2074686174206973206e6f74206f776e4b495031373a20617070726f76656420717565727920666f72206e6f6e6578697374656e7420746f6b656e4b495031373a20617070726f76652063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f76656420666f7220616c6c4b495031373a206f70657261746f7220717565727920666f72206e6f6e6578697374656e7420746f6b656ea165627a7a723058201e253d00dbc3a091b78aa32102a42116d08c55c6c9163a4e841bc1c441fdaf490029526f6c65733a206163636f756e7420697320746865207a65726f2061646472657373'

// KIP-37 token contract source code
// https://github.com/klaytn/klaytn-contracts/tree/master/contracts/token/KIP37/KIP37Token.sol
// The ABI and bytecode below are built via the following command.
// solc --abi --bin --allow-paths . klaytn-contracts/contracts/token/KIP37/KIP37Token.sol
const kip37JsonInterface = [
    {
        constant: true,
        inputs: [{ name: '_id', type: 'uint256' }],
        name: 'paused',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'account', type: 'address' }, { name: 'id', type: 'uint256' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'interfaceId', type: 'bytes4' }],
        name: 'supportsInterface',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: '', type: 'uint256' }],
        name: 'uri',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: '_id', type: 'uint256' }],
        name: 'pause',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'ids', type: 'uint256[]' },
            { name: 'amounts', type: 'uint256[]' },
            { name: 'data', type: 'bytes' },
        ],
        name: 'safeBatchTransferFrom',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'unpause', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: true,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'isPauser',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: '_id', type: 'uint256' }, { name: '_initialSupply', type: 'uint256' }, { name: '_uri', type: 'string' }],
        name: 'create',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'accounts', type: 'address[]' }, { name: 'ids', type: 'uint256[]' }],
        name: 'balanceOfBatch',
        outputs: [{ name: '', type: 'uint256[]' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'paused',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'account', type: 'address' }, { name: 'ids', type: 'uint256[]' }, { name: 'values', type: 'uint256[]' }],
        name: 'burnBatch',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'renouncePauser', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: false,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'addPauser',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: '_id', type: 'uint256' }, { name: '_to', type: 'address' }, { name: '_value', type: 'uint256' }],
        name: 'mint',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'pause', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: false,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'addMinter',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'renounceMinter', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: false,
        inputs: [{ name: 'operator', type: 'address' }, { name: 'approved', type: 'bool' }],
        name: 'setApprovalForAll',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'isMinter',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: '_tokenId', type: 'uint256' }],
        name: 'totalSupply',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: '', type: 'uint256' }],
        name: 'creators',
        outputs: [{ name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: '_id', type: 'uint256' }, { name: '_toList', type: 'address[]' }, { name: '_values', type: 'uint256[]' }],
        name: 'mint',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: '_to', type: 'address' }, { name: '_ids', type: 'uint256[]' }, { name: '_values', type: 'uint256[]' }],
        name: 'mintBatch',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'account', type: 'address' }, { name: 'operator', type: 'address' }],
        name: 'isApprovedForAll',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'id', type: 'uint256' },
            { name: 'amount', type: 'uint256' },
            { name: 'data', type: 'bytes' },
        ],
        name: 'safeTransferFrom',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'account', type: 'address' }, { name: 'id', type: 'uint256' }, { name: 'value', type: 'uint256' }],
        name: 'burn',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: '_id', type: 'uint256' }],
        name: 'unpause',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    { inputs: [{ name: 'uri', type: 'string' }], payable: false, stateMutability: 'nonpayable', type: 'constructor' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'MinterAdded', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'MinterRemoved', type: 'event' },
    {
        anonymous: false,
        inputs: [{ indexed: false, name: 'tokenId', type: 'uint256' }, { indexed: false, name: 'account', type: 'address' }],
        name: 'Paused',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, name: 'tokenId', type: 'uint256' }, { indexed: false, name: 'account', type: 'address' }],
        name: 'Unpaused',
        type: 'event',
    },
    { anonymous: false, inputs: [{ indexed: false, name: 'account', type: 'address' }], name: 'Paused', type: 'event' },
    { anonymous: false, inputs: [{ indexed: false, name: 'account', type: 'address' }], name: 'Unpaused', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'PauserAdded', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'PauserRemoved', type: 'event' },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'operator', type: 'address' },
            { indexed: true, name: 'from', type: 'address' },
            { indexed: true, name: 'to', type: 'address' },
            { indexed: false, name: 'id', type: 'uint256' },
            { indexed: false, name: 'value', type: 'uint256' },
        ],
        name: 'TransferSingle',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'operator', type: 'address' },
            { indexed: true, name: 'from', type: 'address' },
            { indexed: true, name: 'to', type: 'address' },
            { indexed: false, name: 'ids', type: 'uint256[]' },
            { indexed: false, name: 'values', type: 'uint256[]' },
        ],
        name: 'TransferBatch',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'account', type: 'address' },
            { indexed: true, name: 'operator', type: 'address' },
            { indexed: false, name: 'approved', type: 'bool' },
        ],
        name: 'ApprovalForAll',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, name: 'value', type: 'string' }, { indexed: true, name: 'id', type: 'uint256' }],
        name: 'URI',
        type: 'event',
    },
]

// KIP-37 token contract source code
// https://github.com/klaytn/klaytn-contracts/tree/master/contracts/token/KIP37/KIP37Token.sol
const kip37ByteCode =
    '60806040523480156200001157600080fd5b50604051620057e0380380620057e0833981018060405260208110156200003757600080fd5b8101908080516401000000008111156200005057600080fd5b828101905060208101848111156200006757600080fd5b81518560018202830111640100000000821117156200008557600080fd5b505092919050505080620000a66301ffc9a760e01b6200018360201b60201c565b620000b7816200028c60201b60201c565b620000cf636433ca1f60e01b6200018360201b60201c565b620000e7630e89341c60e01b6200018360201b60201c565b5062000100639e094e9e60e01b6200018360201b60201c565b6200011133620002a860201b60201c565b6000600660006101000a81548160ff02191690831515021790555062000144630e8ffdb760e01b6200018360201b60201c565b62000164620001586200030960201b60201c565b6200031160201b60201c565b6200017c63dfd9d9ec60e01b6200018360201b60201c565b50620005e5565b63ffffffff60e01b817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916141562000220576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f4b495031333a20696e76616c696420696e74657266616365206964000000000081525060200191505060405180910390fd5b6001600080837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b8060049080519060200190620002a492919062000536565b5050565b620002c38160056200037260201b62004d6c1790919060201c565b8073ffffffffffffffffffffffffffffffffffffffff167f6719d08c1888103bea251a4ed56406bd0c3e69723c8a1686e017e7bbe159b6f860405160405180910390a250565b600033905090565b6200032c8160086200037260201b62004d6c1790919060201c565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b6200038482826200045660201b60201c565b15620003f8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415620004df576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526022815260200180620057be6022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200057957805160ff1916838001178555620005aa565b82800160010185558215620005aa579182015b82811115620005a95782518255916020019190600101906200058c565b5b509050620005b99190620005bd565b5090565b620005e291905b80821115620005de576000816000905550600101620005c4565b5090565b90565b6151c980620005f56000396000f3fe608060405234801561001057600080fd5b50600436106101c25760003560e01c8063836a1040116100f9578063cd53d08e11610097578063e985e9c511610071578063e985e9c514610f64578063f242432a14610fe0578063f5298aca146110ef578063fabc1cbc14611147576101c2565b8063cd53d08e14610c34578063cfa84fc114610ca2578063d81d0a1514610df8576101c2565b806398650275116100d35780639865027514610b3c578063a22cb46514610b46578063aa271e1a14610b96578063bd85b03914610bf2576101c2565b8063836a104014610a965780638456cb5914610aee578063983b2d5614610af8576101c2565b806346fbf68e116101665780635c975abb116101405780635c975abb146108ba5780636b20c454146108dc5780636ef8d66d14610a4857806382dc1ec414610a52576101c2565b806346fbf68e146105d65780634b068c78146106325780634e1273f414610719576101c2565b80630e89341c116101a25780630e89341c146102d4578063136439dd1461037b5780632eb2c2d6146103a95780633f4ba83a146105cc576101c2565b8062dde10e146101c7578062fdd58e1461020d57806301ffc9a71461026f575b600080fd5b6101f3600480360360208110156101dd57600080fd5b8101908080359060200190929190505050611175565b604051808215151515815260200191505060405180910390f35b6102596004803603604081101561022357600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019092919050505061119f565b6040518082815260200191505060405180910390f35b6102ba6004803603602081101561028557600080fd5b8101908080357bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916906020019092919050505061127f565b604051808215151515815260200191505060405180910390f35b610300600480360360208110156102ea57600080fd5b81019080803590602001909291905050506112e6565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610340578082015181840152602081019050610325565b50505050905090810190601f16801561036d5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6103a76004803603602081101561039157600080fd5b810190808035906020019092919050505061138a565b005b6105ca600480360360a08110156103bf57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019064010000000081111561041c57600080fd5b82018360208201111561042e57600080fd5b8035906020019184602083028401116401000000008311171561045057600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f820116905080830192505050505050509192919290803590602001906401000000008111156104b057600080fd5b8201836020820111156104c257600080fd5b803590602001918460208302840111640100000000831117156104e457600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561054457600080fd5b82018360208201111561055657600080fd5b8035906020019184600183028401116401000000008311171561057857600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050919291929050505061151c565b005b6105d46119ab565b005b610618600480360360208110156105ec57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611b0b565b604051808215151515815260200191505060405180910390f35b6106ff6004803603606081101561064857600080fd5b8101908080359060200190929190803590602001909291908035906020019064010000000081111561067957600080fd5b82018360208201111561068b57600080fd5b803590602001918460018302840111640100000000831117156106ad57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611b28565b604051808215151515815260200191505060405180910390f35b6108636004803603604081101561072f57600080fd5b810190808035906020019064010000000081111561074c57600080fd5b82018360208201111561075e57600080fd5b8035906020019184602083028401116401000000008311171561078057600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f820116905080830192505050505050509192919290803590602001906401000000008111156107e057600080fd5b8201836020820111156107f257600080fd5b8035906020019184602083028401116401000000008311171561081457600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f820116905080830192505050505050509192919290505050611d27565b6040518080602001828103825283818151815260200191508051906020019060200280838360005b838110156108a657808201518184015260208101905061088b565b505050509050019250505060405180910390f35b6108c2611f05565b604051808215151515815260200191505060405180910390f35b610a46600480360360608110156108f257600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019064010000000081111561092f57600080fd5b82018360208201111561094157600080fd5b8035906020019184602083028401116401000000008311171561096357600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f820116905080830192505050505050509192919290803590602001906401000000008111156109c357600080fd5b8201836020820111156109d557600080fd5b803590602001918460208302840111640100000000831117156109f757600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f820116905080830192505050505050509192919290505050611f1c565b005b610a50611fcf565b005b610a9460048036036020811015610a6857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611fda565b005b610aec60048036036060811015610aac57600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050612044565b005b610af6612144565b005b610b3a60048036036020811015610b0e57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506122a5565b005b610b44612316565b005b610b9460048036036040811015610b5c57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803515159060200190929190505050612328565b005b610bd860048036036020811015610bac57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506124c3565b604051808215151515815260200191505060405180910390f35b610c1e60048036036020811015610c0857600080fd5b81019080803590602001909291905050506124e0565b6040518082815260200191505060405180910390f35b610c6060048036036020811015610c4a57600080fd5b81019080803590602001909291905050506124fd565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b610df660048036036060811015610cb857600080fd5b810190808035906020019092919080359060200190640100000000811115610cdf57600080fd5b820183602082011115610cf157600080fd5b80359060200191846020830284011164010000000083111715610d1357600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f82011690508083019250505050505050919291929080359060200190640100000000811115610d7357600080fd5b820183602082011115610d8557600080fd5b80359060200191846020830284011164010000000083111715610da757600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f820116905080830192505050505050509192919290505050612530565b005b610f6260048036036060811015610e0e57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190640100000000811115610e4b57600080fd5b820183602082011115610e5d57600080fd5b80359060200191846020830284011164010000000083111715610e7f57600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f82011690508083019250505050505050919291929080359060200190640100000000811115610edf57600080fd5b820183602082011115610ef157600080fd5b80359060200191846020830284011164010000000083111715610f1357600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f8201169050808301925050505050505091929192905050506126d7565b005b610fc660048036036040811015610f7a57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050612805565b604051808215151515815260200191505060405180910390f35b6110ed600480360360a0811015610ff657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001909291908035906020019064010000000081111561106757600080fd5b82018360208201111561107957600080fd5b8035906020019184600183028401116401000000008311171561109b57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050612899565b005b6111456004803603606081101561110557600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019092919080359060200190929190505050612c0f565b005b6111736004803603602081101561115d57600080fd5b8101908080359060200190929190505050612cc2565b005b60006007600083815260200190815260200160002060009054906101000a900460ff169050919050565b60008073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415611226576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526029815260200180614ee26029913960400191505060405180910390fd5b6001600083815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b6000806000837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060009054906101000a900460ff169050919050565b606060048054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561137e5780601f106113535761010080835404028352916020019161137e565b820191906000526020600020905b81548152906001019060200180831161136157829003601f168201915b50505050509050919050565b61139333611b0b565b6113e8576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180614e6f6030913960400191505060405180910390fd5b600015156007600083815260200190815260200160002060009054906101000a900460ff16151514611482576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601d8152602001807f4b495033375061757361626c653a20616c72656164792070617573656400000081525060200191505060405180910390fd5b60016007600083815260200190815260200160002060006101000a81548160ff0219169083151502179055507fabdb1c9133626eb4f8c5f2ec7e3c60a969a2fb148a0c341a3cf6597242c8f8f58133604051808381526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019250505060405180910390a150565b8151835114611576576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526026815260200180614f5b6026913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff1614156115fc576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260238152602001806150f46023913960400191505060405180910390fd5b611604612e54565b73ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff16148061164a575061164985611644612e54565b612805565b5b61169f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180614f816030913960400191505060405180910390fd5b60006116a9612e54565b90506116b9818787878787612e5c565b60008090505b845181101561188d5760008582815181106116d657fe5b6020026020010151905060008583815181106116ee57fe5b6020026020010151905061177581604051806060016040528060288152602001614fb1602891396001600086815260200190815260200160002060008d73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054612f6f9092919063ffffffff16565b6001600084815260200190815260200160002060008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555061182c816001600085815260200190815260200160002060008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461302f90919063ffffffff16565b6001600084815260200190815260200160002060008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555050508060010190506116bf565b508473ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb8787604051808060200180602001838103835285818151815260200191508051906020019060200280838360005b8381101561193d578082015181840152602081019050611922565b50505050905001838103825284818151815260200191508051906020019060200280838360005b8381101561197f578082015181840152602081019050611964565b5050505090500194505050505060405180910390a46119a28187878787876130b7565b50505050505050565b6119b433611b0b565b611a09576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180614e6f6030913960400191505060405180910390fd5b600660009054906101000a900460ff16611a8b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f5061757361626c653a206e6f742070617573656400000000000000000000000081525060200191505060405180910390fd5b6000600660006101000a81548160ff0219169083151502179055507f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa33604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a1565b6000611b2182600561378790919063ffffffff16565b9050919050565b6000611b3a611b35612e54565b6124c3565b611b8f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180614fd96030913960400191505060405180910390fd5b611b9884613865565b15611c0b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601c8152602001807f4b495033373a20746f6b656e20616c726561647920637265617465640000000081525060200191505060405180910390fd5b336009600086815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550611c78338585604051806020016040528060008152506138d7565b600082511115611d2057837f6bb7ff708619ba0610cba295a58592e0451dee2622938c8755667688daf3529b836040518080602001828103825283818151815260200191508051906020019080838360005b83811015611ce5578082015181840152602081019050611cca565b50505050905090810190601f168015611d125780820380516001836020036101000a031916815260200191505b509250505060405180910390a25b9392505050565b60608151835114611d83576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526027815260200180614e486027913960400191505060405180910390fd5b60608351604051908082528060200260200182016040528015611db55781602001602082028038833980820191505090505b50905060008090505b8451811015611efa57600073ffffffffffffffffffffffffffffffffffffffff16858281518110611deb57fe5b602002602001015173ffffffffffffffffffffffffffffffffffffffff161415611e60576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602f81526020018061514d602f913960400191505060405180910390fd5b60016000858381518110611e7057fe5b602002602001015181526020019081526020016000206000868381518110611e9457fe5b602002602001015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054828281518110611ee357fe5b602002602001018181525050806001019050611dbe565b508091505092915050565b6000600660009054906101000a900460ff16905090565b611f24612e54565b73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161480611f6a5750611f6983611f64612e54565b612805565b5b611fbf576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260278152602001806150cd6027913960400191505060405180910390fd5b611fca838383613b35565b505050565b611fd833613f03565b565b611fe333611b0b565b612038576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180614e6f6030913960400191505060405180910390fd5b61204181613f5d565b50565b61205461204f612e54565b6124c3565b6120a9576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180614fd96030913960400191505060405180910390fd5b6120b283613865565b612124576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260188152602001807f4b495033373a206e6f6e6578697374656e7420746f6b656e000000000000000081525060200191505060405180910390fd5b61213f828483604051806020016040528060008152506138d7565b505050565b61214d33611b0b565b6121a2576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180614e6f6030913960400191505060405180910390fd5b600660009054906101000a900460ff1615612225576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b6001600660006101000a81548160ff0219169083151502179055507f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a25833604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a1565b6122b56122b0612e54565b6124c3565b61230a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180614fd96030913960400191505060405180910390fd5b61231381613fb7565b50565b612326612321612e54565b614011565b565b8173ffffffffffffffffffffffffffffffffffffffff16612347612e54565b73ffffffffffffffffffffffffffffffffffffffff1614156123b4576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260278152602001806150546027913960400191505060405180910390fd5b80600260006123c1612e54565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff1661246e612e54565b73ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3183604051808215151515815260200191505060405180910390a35050565b60006124d982600861378790919063ffffffff16565b9050919050565b600060036000838152602001908152602001600020549050919050565b60096020528060005260406000206000915054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b61254061253b612e54565b6124c3565b612595576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180614fd96030913960400191505060405180910390fd5b61259e83613865565b612610576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260188152602001807f4b495033373a206e6f6e6578697374656e7420746f6b656e000000000000000081525060200191505060405180910390fd5b805182511461266a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526029815260200180614f326029913960400191505060405180910390fd5b60008090505b82518110156126d157600083828151811061268757fe5b60200260200101519050600083838151811061269f57fe5b602002602001015190506126c4828783604051806020016040528060008152506138d7565b5050806001019050612670565b50505050565b6126e76126e2612e54565b6124c3565b61273c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180614fd96030913960400191505060405180910390fd5b60008090505b82518110156127e45761276783828151811061275a57fe5b6020026020010151613865565b6127d9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260188152602001807f4b495033373a206e6f6e6578697374656e7420746f6b656e000000000000000081525060200191505060405180910390fd5b806001019050612742565b506128008383836040518060200160405280600081525061406b565b505050565b6000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16141561291f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260238152602001806150f46023913960400191505060405180910390fd5b612927612e54565b73ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff16148061296d575061296c85612967612e54565b612805565b5b6129c2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260278152602001806150cd6027913960400191505060405180910390fd5b60006129cc612e54565b90506129ec8187876129dd88614424565b6129e688614424565b87612e5c565b612a6983604051806060016040528060288152602001614fb1602891396001600088815260200190815260200160002060008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054612f6f9092919063ffffffff16565b6001600086815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550612b20836001600087815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461302f90919063ffffffff16565b6001600086815260200190815260200160002060008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508473ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f628787604051808381526020018281526020019250505060405180910390a4612c0681878787878761447d565b50505050505050565b612c17612e54565b73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161480612c5d5750612c5c83612c57612e54565b612805565b5b612cb2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260278152602001806150cd6027913960400191505060405180910390fd5b612cbd838383614a29565b505050565b612ccb33611b0b565b612d20576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180614e6f6030913960400191505060405180910390fd5b600115156007600083815260200190815260200160002060009054906101000a900460ff16151514612dba576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f4b495033375061757361626c653a20616c726561647920756e7061757365640081525060200191505060405180910390fd5b60006007600083815260200190815260200160002060006101000a81548160ff0219169083151502179055507ffe9b5e5216db9de81757f43d20f846bea509c040a560d136b8263dd8cd7642388133604051808381526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019250505060405180910390a150565b600033905090565b612e64611f05565b15612eba576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602a81526020018061502a602a913960400191505060405180910390fd5b60008090505b8351811015612f66576000151560076000868481518110612edd57fe5b6020026020010151815260200190815260200160002060009054906101000a900460ff16151514612f59576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602281526020018061517c6022913960400191505060405180910390fd5b8080600101915050612ec0565b50505050505050565b600083831115829061301c576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b83811015612fe1578082015181840152602081019050612fc6565b50505050905090810190601f16801561300e5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b5060008385039050809150509392505050565b6000808284019050838110156130ad576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b60006130d88573ffffffffffffffffffffffffffffffffffffffff16614c9c565b1561377c57600115158573ffffffffffffffffffffffffffffffffffffffff166301ffc9a7634e2312e060e01b6040518263ffffffff1660e01b815260040180827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200191505060206040518083038186803b15801561317757600080fd5b505afa15801561318b573d6000803e3d6000fd5b505050506040513d60208110156131a157600080fd5b8101908080519060200190929190505050151514156134045760008573ffffffffffffffffffffffffffffffffffffffff1663bc197c8189898888886040518663ffffffff1660e01b8152600401808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001806020018060200180602001848103845287818151815260200191508051906020019060200280838360005b8381101561329b578082015181840152602081019050613280565b50505050905001848103835286818151815260200191508051906020019060200280838360005b838110156132dd5780820151818401526020810190506132c2565b50505050905001848103825285818151815260200191508051906020019080838360005b8381101561331c578082015181840152602081019050613301565b50505050905090810190601f1680156133495780820380516001836020036101000a031916815260200191505b5098505050505050505050602060405180830381600087803b15801561336e57600080fd5b505af1158015613382573d6000803e3d6000fd5b505050506040513d602081101561339857600080fd5b8101908080519060200190929190505050905063bc197c8160e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916141561340257600191505061377d565b505b600115158573ffffffffffffffffffffffffffffffffffffffff166301ffc9a7637cc2d01760e01b6040518263ffffffff1660e01b815260040180827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200191505060206040518083038186803b15801561349e57600080fd5b505afa1580156134b2573d6000803e3d6000fd5b505050506040513d60208110156134c857600080fd5b81019080805190602001909291905050501515141561372b5760008573ffffffffffffffffffffffffffffffffffffffff16639b49e33289898888886040518663ffffffff1660e01b8152600401808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001806020018060200180602001848103845287818151815260200191508051906020019060200280838360005b838110156135c25780820151818401526020810190506135a7565b50505050905001848103835286818151815260200191508051906020019060200280838360005b838110156136045780820151818401526020810190506135e9565b50505050905001848103825285818151815260200191508051906020019080838360005b83811015613643578082015181840152602081019050613628565b50505050905090810190601f1680156136705780820380516001836020036101000a031916815260200191505b5098505050505050505050602060405180830381600087803b15801561369557600080fd5b505af11580156136a9573d6000803e3d6000fd5b505050506040513d60208110156136bf57600080fd5b81019080805190602001909291905050509050639b49e33260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916141561372957600191505061377d565b505b6040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260368152602001806151176036913960400191505060405180910390fd5b5b9695505050505050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141561380e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602281526020018061507b6022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b6000806009600084815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415915050919050565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16141561397a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f4b495033373a206d696e7420746f20746865207a65726f20616464726573730081525060200191505060405180910390fd5b6000613984612e54565b90506139a58160008761399688614424565b61399f88614424565b87612e5c565b613a08836001600087815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461302f90919063ffffffff16565b6001600086815260200190815260200160002060008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550613a8283600360008781526020019081526020016000205461302f90919063ffffffff16565b60036000868152602001908152602001600020819055508473ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f628787604051808381526020018281526020019250505060405180910390a4613b2d8160008787878761447d565b505050505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415613bbb576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526021815260200180614ec16021913960400191505060405180910390fd5b8051825114613c15576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526026815260200180614f5b6026913960400191505060405180910390fd5b6000613c1f612e54565b9050613c3f81856000868660405180602001604052806000815250612e5c565b60008090505b8351811015613df557613cf1838281518110613c5d57fe5b6020026020010151604051806060016040528060228152602001614e9f6022913960016000888681518110613c8e57fe5b6020026020010151815260200190815260200160002060008973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054612f6f9092919063ffffffff16565b60016000868481518110613d0157fe5b6020026020010151815260200190815260200160002060008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550613dbe838281518110613d6757fe5b6020026020010151604051806060016040528060278152602001614f0b6027913960036000888681518110613d9857fe5b6020026020010151815260200190815260200160002054612f6f9092919063ffffffff16565b60036000868481518110613dce57fe5b60200260200101518152602001908152602001600020819055508080600101915050613c45565b50600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb8686604051808060200180602001838103835285818151815260200191508051906020019060200280838360005b83811015613ea6578082015181840152602081019050613e8b565b50505050905001838103825284818151815260200191508051906020019060200280838360005b83811015613ee8578082015181840152602081019050613ecd565b5050505090500194505050505060405180910390a450505050565b613f17816005614caf90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167fcd265ebaf09df2871cc7bd4133404a235ba12eff2041bb89d9c714a2621c7c7e60405160405180910390a250565b613f71816005614d6c90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167f6719d08c1888103bea251a4ed56406bd0c3e69723c8a1686e017e7bbe159b6f860405160405180910390a250565b613fcb816008614d6c90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b614025816008614caf90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167fe94479a9f7e1952cc78f2d6baab678adc1b772d936c6583def489e524cb6669260405160405180910390a250565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16141561410e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f4b495033373a206d696e7420746f20746865207a65726f20616464726573730081525060200191505060405180910390fd5b8151835114614168576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526026815260200180614f5b6026913960400191505060405180910390fd5b6000614172612e54565b905061418381600087878787612e5c565b60008090505b84518110156143055761421b600160008784815181106141a557fe5b6020026020010151815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205485838151811061420557fe5b602002602001015161302f90919063ffffffff16565b6001600087848151811061422b57fe5b6020026020010151815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055506142ce6003600087848151811061429557fe5b60200260200101518152602001908152602001600020548583815181106142b857fe5b602002602001015161302f90919063ffffffff16565b600360008784815181106142de57fe5b60200260200101518152602001908152602001600020819055508080600101915050614189565b508473ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb8787604051808060200180602001838103835285818151815260200191508051906020019060200280838360005b838110156143b657808201518184015260208101905061439b565b50505050905001838103825284818151815260200191508051906020019060200280838360005b838110156143f85780820151818401526020810190506143dd565b5050505090500194505050505060405180910390a461441c816000878787876130b7565b505050505050565b60608060016040519080825280602002602001820160405280156144575781602001602082028038833980820191505090505b509050828160008151811061446857fe5b60200260200101818152505080915050919050565b600061449e8573ffffffffffffffffffffffffffffffffffffffff16614c9c565b15614a1a57600060608673ffffffffffffffffffffffffffffffffffffffff1663f23a6e6160e01b8a8a898989604051602401808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200184815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b8381101561457e578082015181840152602081019050614563565b50505050905090810190601f1680156145ab5780820380516001836020036101000a031916815260200191505b509650505050505050604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518082805190602001908083835b602083106146445780518252602082019150602081019050602083039250614621565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d80600081146146a6576040519150601f19603f3d011682016040523d82523d6000602084013e6146ab565b606091505b5091509150818015614726575063f23a6e6160e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19168180602001905160208110156146f457600080fd5b81019080805190602001909291905050507bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b1561473657600192505050614a1f565b8673ffffffffffffffffffffffffffffffffffffffff1663e78b332560e01b8a8a898989604051602401808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200184815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b8381101561480d5780820151818401526020810190506147f2565b50505050905090810190601f16801561483a5780820380516001836020036101000a031916815260200191505b509650505050505050604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518082805190602001908083835b602083106148d357805182526020820191506020810190506020830392506148b0565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d8060008114614935576040519150601f19603f3d011682016040523d82523d6000602084013e61493a565b606091505b5080925081935050508180156149b9575063e78b332560e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191681806020019051602081101561498757600080fd5b81019080805190602001909291905050507bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b156149c957600192505050614a1f565b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603081526020018061509d6030913960400191505060405180910390fd5b600190505b9695505050505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415614aaf576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526021815260200180614ec16021913960400191505060405180910390fd5b6000614ab9612e54565b9050614ae981856000614acb87614424565b614ad487614424565b60405180602001604052806000815250612e5c565b614b6682604051806060016040528060228152602001614e9f602291396001600087815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054612f6f9092919063ffffffff16565b6001600085815260200190815260200160002060008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550614bfa82604051806060016040528060278152602001614f0b602791396003600087815260200190815260200160002054612f6f9092919063ffffffff16565b6003600085815260200190815260200160002081905550600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f628686604051808381526020018281526020019250505060405180910390a450505050565b600080823b905060008111915050919050565b614cb98282613787565b614d0e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260218152602001806150096021913960400191505060405180910390fd5b60008260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b614d768282613787565b15614de9576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff021916908315150217905550505056fe4b495033373a206163636f756e747320616e6420696473206c656e677468206d69736d61746368506175736572526f6c653a2063616c6c657220646f6573206e6f742068617665207468652050617573657220726f6c654b495033373a206275726e20616d6f756e7420657863656564732062616c616e63654b495033373a206275726e2066726f6d20746865207a65726f20616464726573734b495033373a2062616c616e636520717565727920666f7220746865207a65726f20616464726573734b495033373a206275726e20616d6f756e74206578636565647320746f74616c20737570706c794b495033373a20746f4c69737420616e64205f76616c756573206c656e677468206d69736d617463684b495033373a2069647320616e6420616d6f756e7473206c656e677468206d69736d617463684b495033373a207472616e736665722063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f7665644b495033373a20696e73756666696369656e742062616c616e636520666f72207472616e736665724d696e746572526f6c653a2063616c6c657220646f6573206e6f74206861766520746865204d696e74657220726f6c65526f6c65733a206163636f756e7420646f6573206e6f74206861766520726f6c654b495033375061757361626c653a20746f6b656e207472616e73666572207768696c65207061757365644b495033373a2073657474696e6720617070726f76616c2073746174757320666f722073656c66526f6c65733a206163636f756e7420697320746865207a65726f20616464726573734b495033373a207472616e7366657220746f206e6f6e204b49503337526563656976657220696d706c656d656e7465724b495033373a2063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f7665644b495033373a207472616e7366657220746f20746865207a65726f20616464726573734b495033373a206261746368207472616e7366657220746f206e6f6e204b49503337526563656976657220696d706c656d656e7465724b495033373a2062617463682062616c616e636520717565727920666f7220746865207a65726f20616464726573734b495033375061757361626c653a2074686520746f6b656e20697320706175736564a165627a7a723058202aac401709e28b67d3d4c9b72c54634f173278e7b59e3686641908de1a4232040029526f6c65733a206163636f756e7420697320746865207a65726f2061646472657373'

const kip13JsonInterface = [
    {
        constant: true,
        inputs: [{ name: 'interfaceId', type: 'bytes4' }],
        name: 'supportsInterface',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
]

const interfaceIds = {
    preCondition: {
        true: '0x01ffc9a7',
        false: '0xffffffff',
    },
    kip7: {
        IKIP7: '0x65787371',
        IKIP7Metadata: '0xa219a025',
        IKIP7Mintable: '0xeab83e20',
        IKIP7Burnable: '0x3b5a0bf8',
        IKIP7Pausable: '0x4d5507ff',
    },
    kip17: {
        IKIP17: '0x80ac58cd',
        IKIP17Metadata: '0x5b5e139f',
        IKIP17Enumerable: '0x780e9d63',
        IKIP17Mintable: '0xeab83e20',
        IKIP17MetadataMintable: '0xfac27f46',
        IKIP17Burnable: '0x42966c68',
        IKIP17Pausable: '0x4d5507ff',
    },
    kip37: {
        IKIP37: '0x6433ca1f',
        IKIP37Metadata: '0x0e89341c',
        IKIP37Mintable: '0xdfd9d9ec',
        IKIP37Burnable: '0x9e094e9e',
        IKIP37Pausable: '0x0e8ffdb7',
    },
}

module.exports = {
    interfaceIds,
    kip7JsonInterface,
    kip7ByteCode,
    determineSendParams,
    validateDeployParameterForKIP7,
    validateDeployParameterForKIP17,
    validateDeployParameterForKIP37,
    formatParamForUint256,
    kip17JsonInterface,
    kip17ByteCode,
    kip37JsonInterface,
    kip37ByteCode,
    kip13JsonInterface,
}
