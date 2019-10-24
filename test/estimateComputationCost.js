/*
    Copyright 2018 The caver-js Authors
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

require('it-each')({ testPerIteration: true })
const { expect } = require('./extendedChai')

const Caver = require('../index.js')
const testRPCURL = require('./testrpc')

const caver = new Caver(testRPCURL)

let senderPrvKey
let senderAddress
let contractAddress

before(() => {
    senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey

    caver.klay.accounts.wallet.add(senderPrvKey)

    const sender = caver.klay.accounts.privateKeyToAccount(senderPrvKey)
    senderAddress = sender.address
})

describe('estimateComputationCost from Node', () => {
    it('CAVERJS-UNIT-TX-572: estimateComputationCost should return estimated computation cost', async () => {
        const txObj = {
            type: 'SMART_CONTRACT_DEPLOY',
            from: senderAddress,
            value: 1,
            gas: 900000,
            data:
                '0x608060405260008055604051602080610266833981018060405281019080805190602001909291905050508060008190555050610225806100416000396000f30060806040526004361061006d576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd1461007257806342cbb15c1461009d578063a87d942c146100c8578063d14e62b8146100f3578063d880ef5514610113575b600080fd5b34801561007e57600080fd5b50610087610133565b6040518082815260200191505060405180910390f35b3480156100a957600080fd5b506100b2610139565b6040518082815260200191505060405180910390f35b3480156100d457600080fd5b506100dd610141565b6040518082815260200191505060405180910390f35b61011160048036038101908080359060200190929190505050610177565b005b610131600480360381019080803590602001909291905050506101ef565b005b60005481565b600043905090565b60007f7197668b8690d2324050bc9ad83b2b5ca0b3f5336cb178ffa2aa07006b51b65160405160405180910390a1600054905090565b7fe8451a9161f9159bc887328b634789768bd596360ef07c5a5cbfb927c44051f9816040518082815260200191505060405180910390a17f7f922205cebc65a44721f864cd7cac1ce838b329b617d8babd9a6e86cdcbd8f7816040518082815260200191505060405180910390a18060008190555050565b80600081905550505600a165627a7a72305820e3c46c2ca2ea06af4280c0d75bc76b3a13639498257538f0a6e493c0d3807b590029000000000000000000000000000000000000000000000000000000000000000b',
        }
        const receipt = await caver.klay.sendTransaction(txObj)

        const computationCost = await caver.klay.estimateComputationCost({
            to: receipt.contractAddress,
            data: '0xd14e62b80000000000000000000000000000000000000000000000000000000000000022',
        })

        expect(computationCost).not.to.be.null
        expect(computationCost).not.to.be.undefined
        expect(computationCost).not.to.equals('0x0')
        expect(typeof computationCost).to.equals('string')
    }).timeout(50000)

    it('CAVERJS-UNIT-TX-573: estimateComputationCost should return estimated computation cost with latest block tag', async () => {
        const txObj = {
            type: 'SMART_CONTRACT_DEPLOY',
            from: senderAddress,
            value: 1,
            gas: 900000,
            data:
                '0x608060405260008055604051602080610266833981018060405281019080805190602001909291905050508060008190555050610225806100416000396000f30060806040526004361061006d576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd1461007257806342cbb15c1461009d578063a87d942c146100c8578063d14e62b8146100f3578063d880ef5514610113575b600080fd5b34801561007e57600080fd5b50610087610133565b6040518082815260200191505060405180910390f35b3480156100a957600080fd5b506100b2610139565b6040518082815260200191505060405180910390f35b3480156100d457600080fd5b506100dd610141565b6040518082815260200191505060405180910390f35b61011160048036038101908080359060200190929190505050610177565b005b610131600480360381019080803590602001909291905050506101ef565b005b60005481565b600043905090565b60007f7197668b8690d2324050bc9ad83b2b5ca0b3f5336cb178ffa2aa07006b51b65160405160405180910390a1600054905090565b7fe8451a9161f9159bc887328b634789768bd596360ef07c5a5cbfb927c44051f9816040518082815260200191505060405180910390a17f7f922205cebc65a44721f864cd7cac1ce838b329b617d8babd9a6e86cdcbd8f7816040518082815260200191505060405180910390a18060008190555050565b80600081905550505600a165627a7a72305820e3c46c2ca2ea06af4280c0d75bc76b3a13639498257538f0a6e493c0d3807b590029000000000000000000000000000000000000000000000000000000000000000b',
        }
        const receipt = await caver.klay.sendTransaction(txObj)

        const computationCost = await caver.klay.estimateComputationCost(
            {
                to: receipt.contractAddress,
                data: '0xd14e62b80000000000000000000000000000000000000000000000000000000000000022',
            },
            'latest'
        )

        expect(computationCost).not.to.be.null
        expect(computationCost).not.to.be.undefined
        expect(computationCost).not.to.equals('0x0')
        expect(typeof computationCost).to.equals('string')
    }).timeout(50000)
})
