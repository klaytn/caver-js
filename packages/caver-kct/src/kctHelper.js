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

async function determineSendParams(executableObj, sendParam, defaultFrom) {
    let { from, gas } = sendParam
    from = from || defaultFrom
    if (!from)
        throw new Error(
            `'from' is missing. Please pass the sender's address in sendParam.from or define default sender address at 'kctContract.options.from'.`
        )

    if (gas === undefined) {
        const estimated = await executableObj.estimateGas({ from })
        const originalGas = new BigNumber(estimated, 10)
        const bufferGas = new BigNumber(1.5, 10)

        gas = Math.round(originalGas.times(bufferGas))
    }

    return { from, gas, gasPrice: sendParam.gasPrice, value: sendParam.value }
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

// KIP-7 token contract source code
// caver-js/packages/caver-klay/caver-kct/src/contract/token/KIP7/KIP7Token.sol
// The ABI and bytecode below are built via the following command.
// solc --abi --bin --allow-paths . ./packages/caver-klay/caver-kct/src/contract/token/KIP7/KIP7Token.sol
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
// caver-js/packages/caver-klay/caver-klay-kct/contract/token/KIP7/KIP7Token.sol
const kip7ByteCode =
    '60806040523480156200001157600080fd5b5060405162002f8438038062002f84833981018060405260808110156200003757600080fd5b8101908080516401000000008111156200005057600080fd5b828101905060208101848111156200006757600080fd5b81518560018202830111640100000000821117156200008557600080fd5b50509291906020018051640100000000811115620000a257600080fd5b82810190506020810184811115620000b957600080fd5b8151856001820283011164010000000082111715620000d757600080fd5b50509291906020018051906020019092919080519060200190929190505050838383620001116301ffc9a760e01b6200023260201b60201c565b62000129636578737160e01b6200023260201b60201c565b6200013a336200033b60201b60201c565b6200015263eab83e2060e01b6200023260201b60201c565b6200016a633b5a0bf860e01b6200023260201b60201c565b6200017b336200039c60201b60201c565b6000600660006101000a81548160ff021916908315150217905550620001ae634d5507ff60e01b6200023260201b60201c565b8260079080519060200190620001c692919062000816565b508160089080519060200190620001df92919062000816565b5080600960006101000a81548160ff021916908360ff1602179055506200021363a219a02560e01b6200023260201b60201c565b505050620002283382620003fd60201b60201c565b50505050620008c5565b63ffffffff60e01b817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161415620002cf576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f4b495031333a20696e76616c696420696e74657266616365206964000000000081525060200191505060405180910390fd5b6001600080837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b62000356816004620005c960201b620024181790919060201c565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b620003b7816005620005c960201b620024181790919060201c565b8073ffffffffffffffffffffffffffffffffffffffff167f6719d08c1888103bea251a4ed56406bd0c3e69723c8a1686e017e7bbe159b6f860405160405180910390a250565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415620004a1576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f4b4950373a206d696e7420746f20746865207a65726f2061646472657373000081525060200191505060405180910390fd5b620004bd81600354620006ad60201b620022d31790919060201c565b6003819055506200051c81600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054620006ad60201b620022d31790919060201c565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b620005db82826200073660201b60201c565b156200064f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b6000808284019050838110156200072c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415620007bf576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602281526020018062002f626022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200085957805160ff19168380011785556200088a565b828001600101855582156200088a579182015b82811115620008895782518255916020019190600101906200086c565b5b5090506200089991906200089d565b5090565b620008c291905b80821115620008be576000816000905550600101620008a4565b5090565b90565b61268d80620008d56000396000f3fe608060405234801561001057600080fd5b506004361061018e5760003560e01c80636ef8d66d116100de578063983b2d5611610097578063aa271e1a11610071578063aa271e1a146107b6578063b88d4fde14610812578063dd62ed3e14610917578063eb7955491461098f5761018e565b8063983b2d56146107025780639865027514610746578063a9059cbb146107505761018e565b80636ef8d66d1461058157806370a082311461058b57806379cc6790146105e357806382dc1ec4146106315780638456cb591461067557806395d89b411461067f5761018e565b80633f4ba83a1161014b57806342842e0e1161012557806342842e0e1461046757806342966c68146104d557806346fbf68e146105035780635c975abb1461055f5761018e565b80633f4ba83a146103a957806340c10f19146103b3578063423f6cef146104195761018e565b806301ffc9a71461019357806306fdde03146101f8578063095ea7b31461027b57806318160ddd146102e157806323b872dd146102ff578063313ce56714610385575b600080fd5b6101de600480360360208110156101a957600080fd5b8101908080357bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19169060200190929190505050610a74565b604051808215151515815260200191505060405180910390f35b610200610adb565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610240578082015181840152602081019050610225565b50505050905090810190601f16801561026d5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102c76004803603604081101561029157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610b7d565b604051808215151515815260200191505060405180910390f35b6102e9610c14565b6040518082815260200191505060405180910390f35b61036b6004803603606081101561031557600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610c1e565b604051808215151515815260200191505060405180910390f35b61038d610cb7565b604051808260ff1660ff16815260200191505060405180910390f35b6103b1610cce565b005b6103ff600480360360408110156103c957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610e2e565b604051808215151515815260200191505060405180910390f35b6104656004803603604081101561042f57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610ea2565b005b6104d36004803603606081101561047d57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610ec0565b005b610501600480360360208110156104eb57600080fd5b8101908080359060200190929190505050610ee0565b005b6105456004803603602081101561051957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610eed565b604051808215151515815260200191505060405180910390f35b610567610f0a565b604051808215151515815260200191505060405180910390f35b610589610f21565b005b6105cd600480360360208110156105a157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610f2c565b6040518082815260200191505060405180910390f35b61062f600480360360408110156105f957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610f75565b005b6106736004803603602081101561064757600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610f83565b005b61067d610fed565b005b61068761114e565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156106c75780820151818401526020810190506106ac565b50505050905090810190601f1680156106f45780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6107446004803603602081101561071857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506111f0565b005b61074e61125a565b005b61079c6004803603604081101561076657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050611265565b604051808215151515815260200191505060405180910390f35b6107f8600480360360208110156107cc57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506112fc565b604051808215151515815260200191505060405180910390f35b6109156004803603608081101561082857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291908035906020019064010000000081111561088f57600080fd5b8201836020820111156108a157600080fd5b803590602001918460018302840111640100000000831117156108c357600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611319565b005b6109796004803603604081101561092d57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061138c565b6040518082815260200191505060405180910390f35b610a72600480360360608110156109a557600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156109ec57600080fd5b8201836020820111156109fe57600080fd5b80359060200191846001830284011164010000000083111715610a2057600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611413565b005b6000806000837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060009054906101000a900460ff169050919050565b606060078054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610b735780601f10610b4857610100808354040283529160200191610b73565b820191906000526020600020905b815481529060010190602001808311610b5657829003601f168201915b5050505050905090565b6000600660009054906101000a900460ff1615610c02576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b610c0c8383611484565b905092915050565b6000600354905090565b6000600660009054906101000a900460ff1615610ca3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b610cae84848461149b565b90509392505050565b6000600960009054906101000a900460ff16905090565b610cd733610eed565b610d2c576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806125566030913960400191505060405180910390fd5b600660009054906101000a900460ff16610dae576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f5061757361626c653a206e6f742070617573656400000000000000000000000081525060200191505060405180910390fd5b6000600660006101000a81548160ff0219169083151502179055507f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa33604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a1565b6000610e39336112fc565b610e8e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806125a86030913960400191505060405180910390fd5b610e98838361154c565b6001905092915050565b610ebc828260405180602001604052806000815250611413565b5050565b610edb83838360405180602001604052806000815250611319565b505050565b610eea3382611709565b50565b6000610f038260056118c690919063ffffffff16565b9050919050565b6000600660009054906101000a900460ff16905090565b610f2a336119a4565b565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b610f7f82826119fe565b5050565b610f8c33610eed565b610fe1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806125566030913960400191505060405180910390fd5b610fea81611aa5565b50565b610ff633610eed565b61104b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806125566030913960400191505060405180910390fd5b600660009054906101000a900460ff16156110ce576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b6001600660006101000a81548160ff0219169083151502179055507f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a25833604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a1565b606060088054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156111e65780601f106111bb576101008083540402835291602001916111e6565b820191906000526020600020905b8154815290600101906020018083116111c957829003601f168201915b5050505050905090565b6111f9336112fc565b61124e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806125a86030913960400191505060405180910390fd5b61125781611aff565b50565b61126333611b59565b565b6000600660009054906101000a900460ff16156112ea576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b6112f48383611bb3565b905092915050565b60006113128260046118c690919063ffffffff16565b9050919050565b611324848484610c1e565b5061133184848484611bca565b611386576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602e815260200180612528602e913960400191505060405180910390fd5b50505050565b6000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b61141d8383611265565b5061142a33848484611bca565b61147f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602e815260200180612528602e913960400191505060405180910390fd5b505050565b6000611491338484611db3565b6001905092915050565b60006114a8848484611faa565b611541843361153c85600260008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461224a90919063ffffffff16565b611db3565b600190509392505050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156115ef576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f4b4950373a206d696e7420746f20746865207a65726f2061646472657373000081525060200191505060405180910390fd5b611604816003546122d390919063ffffffff16565b60038190555061165c81600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546122d390919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156117ac576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f4b4950373a206275726e2066726f6d20746865207a65726f206164647265737381525060200191505060405180910390fd5b6117c18160035461224a90919063ffffffff16565b60038190555061181981600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461224a90919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141561194d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602281526020018061261d6022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b6119b881600561235b90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167fcd265ebaf09df2871cc7bd4133404a235ba12eff2041bb89d9c714a2621c7c7e60405160405180910390a250565b611a088282611709565b611aa18233611a9c84600260008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461224a90919063ffffffff16565b611db3565b5050565b611ab981600561241890919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167f6719d08c1888103bea251a4ed56406bd0c3e69723c8a1686e017e7bbe159b6f860405160405180910390a250565b611b1381600461241890919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b611b6d81600461235b90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167fe94479a9f7e1952cc78f2d6baab678adc1b772d936c6583def489e524cb6669260405160405180910390a250565b6000611bc0338484611faa565b6001905092915050565b6000611beb8473ffffffffffffffffffffffffffffffffffffffff166124f3565b611bf85760019050611dab565b60008473ffffffffffffffffffffffffffffffffffffffff16639d188c22338887876040518563ffffffff1660e01b8152600401808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b83811015611cd3578082015181840152602081019050611cb8565b50505050905090810190601f168015611d005780820380516001836020036101000a031916815260200191505b5095505050505050602060405180830381600087803b158015611d2257600080fd5b505af1158015611d36573d6000803e3d6000fd5b505050506040513d6020811015611d4c57600080fd5b81019080805190602001909291905050509050639d188c2260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916149150505b949350505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415611e39576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602381526020018061263f6023913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611ebf576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260218152602001806125076021913960400191505060405180910390fd5b80600260008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925836040518082815260200191505060405180910390a3505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415612030576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001806125f96024913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156120b6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806125866022913960400191505060405180910390fd5b61210881600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461224a90919063ffffffff16565b600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555061219d81600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546122d390919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a3505050565b6000828211156122c2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f536166654d6174683a207375627472616374696f6e206f766572666c6f77000081525060200191505060405180910390fd5b600082840390508091505092915050565b600080828401905083811015612351576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b61236582826118c6565b6123ba576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260218152602001806125d86021913960400191505060405180910390fd5b60008260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b61242282826118c6565b15612495576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b600080823b90506000811191505091905056fe4b4950373a20617070726f766520746f20746865207a65726f20616464726573734b4950373a207472616e7366657220746f206e6f6e204b495037526563656976657220696d706c656d656e746572506175736572526f6c653a2063616c6c657220646f6573206e6f742068617665207468652050617573657220726f6c654b4950373a207472616e7366657220746f20746865207a65726f20616464726573734d696e746572526f6c653a2063616c6c657220646f6573206e6f74206861766520746865204d696e74657220726f6c65526f6c65733a206163636f756e7420646f6573206e6f74206861766520726f6c654b4950373a207472616e736665722066726f6d20746865207a65726f2061646472657373526f6c65733a206163636f756e7420697320746865207a65726f20616464726573734b4950373a20617070726f76652066726f6d20746865207a65726f2061646472657373a165627a7a72305820e51fab94e7709d70e4b7ff4aaaf6428d983cfa2bbfb4be772ec2de87ea0a2b9f0029526f6c65733a206163636f756e7420697320746865207a65726f2061646472657373'

// KIP-17 token contract source code
// caver-js/packages/caver-klay/caver-klay-kct/contract/token/KIP17/KIP17Token.sol
// The ABI and bytecode below are built via the following command.
// solc --abi --bin --allow-paths . ./packages/caver-klay/caver-klay-kct/contract/token/KIP17/KIP17Token.sol
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
// caver-js/packages/caver-klay/caver-klay-kct/contract/token/KIP17/KIP17Token.sol
const kip17ByteCode =
    '60806040523480156200001157600080fd5b5060405162003ed838038062003ed8833981018060405260408110156200003757600080fd5b8101908080516401000000008111156200005057600080fd5b828101905060208101848111156200006757600080fd5b81518560018202830111640100000000821117156200008557600080fd5b50509291906020018051640100000000811115620000a257600080fd5b82810190506020810184811115620000b957600080fd5b8151856001820283011164010000000082111715620000d757600080fd5b505092919050505081818181620000fb6301ffc9a760e01b6200021e60201b60201c565b620001136380ac58cd60e01b6200021e60201b60201c565b6200012b63780e9d6360e01b6200021e60201b60201c565b816009908051906020019062000143929190620005ad565b5080600a90805190602001906200015c929190620005ad565b5062000175635b5e139f60e01b6200021e60201b60201c565b505050506200018a336200032760201b60201c565b620001a263eab83e2060e01b6200021e60201b60201c565b620001ba63fac27f4660e01b6200021e60201b60201c565b620001d26342966c6860e01b6200021e60201b60201c565b620001e3336200038860201b60201c565b6000600e60006101000a81548160ff02191690831515021790555062000216634d5507ff60e01b6200021e60201b60201c565b50506200065c565b63ffffffff60e01b817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161415620002bb576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f4b495031333a20696e76616c696420696e74657266616365206964000000000081525060200191505060405180910390fd5b6001600080837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b6200034281600c620003e960201b62002aee1790919060201c565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b620003a381600d620003e960201b62002aee1790919060201c565b8073ffffffffffffffffffffffffffffffffffffffff167f6719d08c1888103bea251a4ed56406bd0c3e69723c8a1686e017e7bbe159b6f860405160405180910390a250565b620003fb8282620004cd60201b60201c565b156200046f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141562000556576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602281526020018062003eb66022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10620005f057805160ff191683800117855562000621565b8280016001018555821562000621579182015b828111156200062057825182559160200191906001019062000603565b5b50905062000630919062000634565b5090565b6200065991905b80821115620006555760008160009055506001016200063b565b5090565b90565b61384a806200066c6000396000f3fe608060405234801561001057600080fd5b50600436106101c45760003560e01c80635c975abb116100f9578063983b2d5611610097578063aa271e1a11610071578063aa271e1a14610963578063b88d4fde146109bf578063c87b56dd14610ac4578063e985e9c514610b6b576101c4565b8063983b2d56146108c55780639865027514610909578063a22cb46514610913576101c4565b806370a08231116100d357806370a082311461079c57806382dc1ec4146107f45780638456cb591461083857806395d89b4114610842576101c4565b80635c975abb146107025780636352211e146107245780636ef8d66d14610792576101c4565b80633f4ba83a1161016657806342966c681161014057806342966c681461053957806346fbf68e146105675780634f6ccce7146105c357806350bb4e7f14610605576101c4565b80633f4ba83a1461045b57806340c10f191461046557806342842e0e146104cb576101c4565b8063095ea7b3116101a2578063095ea7b31461031f57806318160ddd1461036d57806323b872dd1461038b5780632f745c59146103f9576101c4565b806301ffc9a7146101c957806306fdde031461022e578063081812fc146102b1575b600080fd5b610214600480360360208110156101df57600080fd5b8101908080357bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19169060200190929190505050610be7565b604051808215151515815260200191505060405180910390f35b610236610c4e565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561027657808201518184015260208101905061025b565b50505050905090810190601f1680156102a35780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102dd600480360360208110156102c757600080fd5b8101908080359060200190929190505050610cf0565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b61036b6004803603604081101561033557600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610d8b565b005b610375610e1c565b6040518082815260200191505060405180910390f35b6103f7600480360360608110156103a157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610e29565b005b6104456004803603604081101561040f57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610ebc565b6040518082815260200191505060405180910390f35b610463610f7b565b005b6104b16004803603604081101561047b57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506110db565b604051808215151515815260200191505060405180910390f35b610537600480360360608110156104e157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019092919050505061114f565b005b6105656004803603602081101561054f57600080fd5b810190808035906020019092919050505061116f565b005b6105a96004803603602081101561057d57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506111da565b604051808215151515815260200191505060405180910390f35b6105ef600480360360208110156105d957600080fd5b81019080803590602001909291905050506111f7565b6040518082815260200191505060405180910390f35b6106e86004803603606081101561061b57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291908035906020019064010000000081111561066257600080fd5b82018360208201111561067457600080fd5b8035906020019184600183028401116401000000008311171561069657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611277565b604051808215151515815260200191505060405180910390f35b61070a6112f6565b604051808215151515815260200191505060405180910390f35b6107506004803603602081101561073a57600080fd5b810190808035906020019092919050505061130d565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b61079a6113d5565b005b6107de600480360360208110156107b257600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506113e0565b6040518082815260200191505060405180910390f35b6108366004803603602081101561080a57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506114b5565b005b61084061151f565b005b61084a611680565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561088a57808201518184015260208101905061086f565b50505050905090810190601f1680156108b75780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b610907600480360360208110156108db57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611722565b005b61091161178c565b005b6109616004803603604081101561092957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803515159060200190929190505050611797565b005b6109a56004803603602081101561097957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611828565b604051808215151515815260200191505060405180910390f35b610ac2600480360360808110156109d557600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019092919080359060200190640100000000811115610a3c57600080fd5b820183602082011115610a4e57600080fd5b80359060200191846001830284011164010000000083111715610a7057600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611845565b005b610af060048036036020811015610ada57600080fd5b81019080803590602001909291905050506118b7565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610b30578082015181840152602081019050610b15565b50505050905090810190601f168015610b5d5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b610bcd60048036036040811015610b8157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506119ca565b604051808215151515815260200191505060405180910390f35b6000806000837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060009054906101000a900460ff169050919050565b606060098054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610ce65780601f10610cbb57610100808354040283529160200191610ce6565b820191906000526020600020905b815481529060010190602001808311610cc957829003601f168201915b5050505050905090565b6000610cfb82611a5e565b610d50576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b815260200180613792602b913960400191505060405180910390fd5b6002600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b600e60009054906101000a900460ff1615610e0e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b610e188282611ad0565b5050565b6000600780549050905090565b600e60009054906101000a900460ff1615610eac576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b610eb7838383611cc6565b505050565b6000610ec7836113e0565b8210610f1e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602a815260200180613573602a913960400191505060405180910390fd5b600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208281548110610f6857fe5b9060005260206000200154905092915050565b610f84336111da565b610fd9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806135206030913960400191505060405180910390fd5b600e60009054906101000a900460ff1661105b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f5061757361626c653a206e6f742070617573656400000000000000000000000081525060200191505060405180910390fd5b6000600e60006101000a81548160ff0219169083151502179055507f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa33604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a1565b60006110e633611828565b61113b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603081526020018061359d6030913960400191505060405180910390fd5b6111458383611d35565b6001905092915050565b61116a83838360405180602001604052806000815250611845565b505050565b6111793382611d56565b6111ce576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602f8152602001806136c3602f913960400191505060405180910390fd5b6111d781611e4a565b50565b60006111f082600d611e5f90919063ffffffff16565b9050919050565b6000611201610e1c565b8210611258576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b815260200180613743602b913960400191505060405180910390fd5b6007828154811061126557fe5b90600052602060002001549050919050565b600061128233611828565b6112d7576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603081526020018061359d6030913960400191505060405180910390fd5b6112e18484611d35565b6112eb8383611f3d565b600190509392505050565b6000600e60009054906101000a900460ff16905090565b6000806001600084815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156113cc576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260288152602001806135ee6028913960400191505060405180910390fd5b80915050919050565b6113de33611fc7565b565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611467576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260298152602001806136f26029913960400191505060405180910390fd5b6114ae600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020612021565b9050919050565b6114be336111da565b611513576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806135206030913960400191505060405180910390fd5b61151c8161202f565b50565b611528336111da565b61157d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806135206030913960400191505060405180910390fd5b600e60009054906101000a900460ff1615611600576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b6001600e60006101000a81548160ff0219169083151502179055507f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a25833604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a1565b6060600a8054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156117185780601f106116ed57610100808354040283529160200191611718565b820191906000526020600020905b8154815290600101906020018083116116fb57829003601f168201915b5050505050905090565b61172b33611828565b611780576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603081526020018061359d6030913960400191505060405180910390fd5b61178981612089565b50565b611795336120e3565b565b600e60009054906101000a900460ff161561181a576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b611824828261213d565b5050565b600061183e82600c611e5f90919063ffffffff16565b9050919050565b611850848484610e29565b61185c848484846122e0565b6118b1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806136936030913960400191505060405180910390fd5b50505050565b60606118c282611a5e565b611917576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602e8152602001806134f2602e913960400191505060405180910390fd5b600b60008381526020019081526020016000208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156119be5780601f10611993576101008083540402835291602001916119be565b820191906000526020600020905b8154815290600101906020018083116119a157829003601f168201915b50505050509050919050565b6000600460008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b6000806001600084815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415915050919050565b6000611adb8261130d565b90508073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415611b7f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f4b495031373a20617070726f76616c20746f2063757272656e74206f776e657281525060200191505060405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161480611bbf5750611bbe81336119ca565b5b611c14576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260378152602001806137bd6037913960400191505060405180910390fd5b826002600084815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550818373ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a4505050565b611cd03382611d56565b611d25576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806136416030913960400191505060405180910390fd5b611d30838383612685565b505050565b611d3f82826126a9565b611d4982826128c1565b611d5281612988565b5050565b6000611d6182611a5e565b611db6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b8152602001806137f4602b913960400191505060405180910390fd5b6000611dc18361130d565b90508073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161480611e3057508373ffffffffffffffffffffffffffffffffffffffff16611e1884610cf0565b73ffffffffffffffffffffffffffffffffffffffff16145b80611e415750611e4081856119ca565b5b91505092915050565b611e5c611e568261130d565b826129d4565b50565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611ee6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806136716022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b611f4682611a5e565b611f9b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b815260200180613616602b913960400191505060405180910390fd5b80600b60008481526020019081526020016000209080519060200190611fc29291906133d8565b505050565b611fdb81600d612a3190919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167fcd265ebaf09df2871cc7bd4133404a235ba12eff2041bb89d9c714a2621c7c7e60405160405180910390a250565b600081600001549050919050565b61204381600d612aee90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167f6719d08c1888103bea251a4ed56406bd0c3e69723c8a1686e017e7bbe159b6f860405160405180910390a250565b61209d81600c612aee90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b6120f781600c612a3190919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167fe94479a9f7e1952cc78f2d6baab678adc1b772d936c6583def489e524cb6669260405160405180910390a250565b3373ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156121df576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260188152602001807f4b495031373a20617070726f766520746f2063616c6c6572000000000000000081525060200191505060405180910390fd5b80600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3183604051808215151515815260200191505060405180910390a35050565b60006123018473ffffffffffffffffffffffffffffffffffffffff16612bc9565b61230e576001905061267d565b60008473ffffffffffffffffffffffffffffffffffffffff1663150b7a02338887876040518563ffffffff1660e01b8152600401808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b838110156123e95780820151818401526020810190506123ce565b50505050905090810190601f1680156124165780820380516001836020036101000a031916815260200191505b5095505050505050602060405180830381600087803b15801561243857600080fd5b505af115801561244c573d6000803e3d6000fd5b505050506040513d602081101561246257600080fd5b8101908080519060200190929190505050905063150b7a0260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614156124cc57600191505061267d565b8473ffffffffffffffffffffffffffffffffffffffff16636745782b338887876040518563ffffffff1660e01b8152600401808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b838110156125a557808201518184015260208101905061258a565b50505050905090810190601f1680156125d25780820380516001836020036101000a031916815260200191505b5095505050505050602060405180830381600087803b1580156125f457600080fd5b505af1158015612608573d6000803e3d6000fd5b505050506040513d602081101561261e57600080fd5b81019080805190602001909291905050509050636745782b60e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916149150505b949350505050565b612690838383612bdc565b61269a8382612e37565b6126a482826128c1565b505050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141561274c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f4b495031373a206d696e7420746f20746865207a65726f20616464726573730081525060200191505060405180910390fd5b61275581611a5e565b156127c8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f4b495031373a20746f6b656e20616c7265616479206d696e746564000000000081525060200191505060405180910390fd5b816001600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550612861600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020612fd5565b808273ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a45050565b600560008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805490506006600083815260200190815260200160002081905550600560008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190806001815401808255809150509060018203906000526020600020016000909192909190915055505050565b6007805490506008600083815260200190815260200160002081905550600781908060018154018082558091505090600182039060005260206000200160009091929091909150555050565b6129de8282612feb565b6000600b600083815260200190815260200160002080546001816001161561010002031660029004905014612a2d57600b60008281526020019081526020016000206000612a2c9190613458565b5b5050565b612a3b8282611e5f565b612a90576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260218152602001806135cd6021913960400191505060405180910390fd5b60008260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b612af88282611e5f565b15612b6b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b600080823b905060008111915050919050565b8273ffffffffffffffffffffffffffffffffffffffff16612bfc8261130d565b73ffffffffffffffffffffffffffffffffffffffff1614612c68576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602881526020018061371b6028913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415612cee576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260238152602001806135506023913960400191505060405180910390fd5b612cf781613025565b612d3e600360008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206130e3565b612d85600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020612fd5565b816001600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a4505050565b6000612e8f6001600560008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208054905061310690919063ffffffff16565b9050600060066000848152602001908152602001600020549050818114612f7c576000600560008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208381548110612efc57fe5b9060005260206000200154905080600560008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208381548110612f5457fe5b9060005260206000200181905550816006600083815260200190815260200160002081905550505b600560008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805480919060019003612fce91906134a0565b5050505050565b6001816000016000828254019250508190555050565b612ff5828261318f565b612fff8282612e37565b600060066000838152602001908152602001600020819055506130218161331e565b5050565b600073ffffffffffffffffffffffffffffffffffffffff166002600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16146130e05760006002600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b50565b6130fb6001826000015461310690919063ffffffff16565b816000018190555050565b60008282111561317e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f536166654d6174683a207375627472616374696f6e206f766572666c6f77000081525060200191505060405180910390fd5b600082840390508091505092915050565b8173ffffffffffffffffffffffffffffffffffffffff166131af8261130d565b73ffffffffffffffffffffffffffffffffffffffff161461321b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602481526020018061376e6024913960400191505060405180910390fd5b61322481613025565b61326b600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206130e3565b60006001600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a45050565b6000613339600160078054905061310690919063ffffffff16565b905060006008600084815260200190815260200160002054905060006007838154811061336257fe5b90600052602060002001549050806007838154811061337d57fe5b906000526020600020018190555081600860008381526020019081526020016000208190555060078054809190600190036133b891906134a0565b506000600860008681526020019081526020016000208190555050505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061341957805160ff1916838001178555613447565b82800160010185558215613447579182015b8281111561344657825182559160200191906001019061342b565b5b50905061345491906134cc565b5090565b50805460018160011615610100020316600290046000825580601f1061347e575061349d565b601f01602090049060005260206000209081019061349c91906134cc565b5b50565b8154818355818111156134c7578183600052602060002091820191016134c691906134cc565b5b505050565b6134ee91905b808211156134ea5760008160009055506001016134d2565b5090565b9056fe4b495031374d657461646174613a2055524920717565727920666f72206e6f6e6578697374656e7420746f6b656e506175736572526f6c653a2063616c6c657220646f6573206e6f742068617665207468652050617573657220726f6c654b495031373a207472616e7366657220746f20746865207a65726f20616464726573734b49503137456e756d657261626c653a206f776e657220696e646578206f7574206f6620626f756e64734d696e746572526f6c653a2063616c6c657220646f6573206e6f74206861766520746865204d696e74657220726f6c65526f6c65733a206163636f756e7420646f6573206e6f74206861766520726f6c654b495031373a206f776e657220717565727920666f72206e6f6e6578697374656e7420746f6b656e4b495031374d657461646174613a2055524920736574206f66206e6f6e6578697374656e7420746f6b656e4b495031373a207472616e736665722063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f766564526f6c65733a206163636f756e7420697320746865207a65726f20616464726573734b495031373a207472616e7366657220746f206e6f6e204b49503137526563656976657220696d706c656d656e7465724b495031374275726e61626c653a2063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f7665644b495031373a2062616c616e636520717565727920666f7220746865207a65726f20616464726573734b495031373a207472616e73666572206f6620746f6b656e2074686174206973206e6f74206f776e4b49503137456e756d657261626c653a20676c6f62616c20696e646578206f7574206f6620626f756e64734b495031373a206275726e206f6620746f6b656e2074686174206973206e6f74206f776e4b495031373a20617070726f76656420717565727920666f72206e6f6e6578697374656e7420746f6b656e4b495031373a20617070726f76652063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f76656420666f7220616c6c4b495031373a206f70657261746f7220717565727920666f72206e6f6e6578697374656e7420746f6b656ea165627a7a7230582000d5e9685405ed71419a43044d67f59dab0ee06de879e7ee8005d484e5f2efb80029526f6c65733a206163636f756e7420697320746865207a65726f2061646472657373'

module.exports = {
    kip7JsonInterface,
    kip7ByteCode,
    determineSendParams,
    validateDeployParameterForKIP7,
    validateDeployParameterForKIP17,
    formatParamForUint256,
    kip17JsonInterface,
    kip17ByteCode,
}
