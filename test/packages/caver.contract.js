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

const testRPCURL = require('../testrpc')
const { expect } = require('../extendedChai')
const { TX_TYPE_STRING } = require('../../packages/caver-transaction/src/transactionHelper/transactionHelper')

const Caver = require('../../index')

let caver
let sender
let feePayer
let contractAddress
let keyString
let valueString
let password

before(() => {
    caver = new Caver(testRPCURL)

    const senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey

    const feePayerPrvKey =
        process.env.privateKey2 && String(process.env.privateKey2).indexOf('0x') === -1
            ? `0x${process.env.privateKey2}`
            : process.env.privateKey2

    sender = caver.wallet.keyring.createFromPrivateKey(senderPrvKey)
    feePayer = caver.wallet.keyring.createFromPrivateKey(feePayerPrvKey)
    caver.wallet.add(sender)
    caver.wallet.add(feePayer)

    password = process.env.password ? process.env.password : 'password'
})

describe('caver.contract makes it easy to interact with smart contracts on the Klaytn blockchain platform', () => {
    const byteCodeWithoutConstructor =
        '608060405234801561001057600080fd5b5061051f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063693ec85e1461003b578063e942b5161461016f575b600080fd5b6100f46004803603602081101561005157600080fd5b810190808035906020019064010000000081111561006e57600080fd5b82018360208201111561008057600080fd5b803590602001918460018302840111640100000000831117156100a257600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506102c1565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610134578082015181840152602081019050610119565b50505050905090810190601f1680156101615780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102bf6004803603604081101561018557600080fd5b81019080803590602001906401000000008111156101a257600080fd5b8201836020820111156101b457600080fd5b803590602001918460018302840111640100000000831117156101d657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561023957600080fd5b82018360208201111561024b57600080fd5b8035906020019184600183028401116401000000008311171561026d57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506103cc565b005b60606000826040518082805190602001908083835b602083106102f957805182526020820191506020810190506020830392506102d6565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156103c05780601f10610395576101008083540402835291602001916103c0565b820191906000526020600020905b8154815290600101906020018083116103a357829003601f168201915b50505050509050919050565b806000836040518082805190602001908083835b6020831061040357805182526020820191506020810190506020830392506103e0565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020908051906020019061044992919061044e565b505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061048f57805160ff19168380011785556104bd565b828001600101855582156104bd579182015b828111156104bc5782518255916020019190600101906104a1565b5b5090506104ca91906104ce565b5090565b6104f091905b808211156104ec5760008160009055506001016104d4565b5090565b9056fea165627a7a723058203ffebc792829e0434ecc495da1b53d24399cd7fff506a4fd03589861843e14990029'
    const abiWithoutConstructor = [
        {
            constant: true,
            inputs: [{ name: 'key', type: 'string' }],
            name: 'get',
            outputs: [{ name: '', type: 'string' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: false,
            inputs: [{ name: 'key', type: 'string' }, { name: 'value', type: 'string' }],
            name: 'set',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ]

    const byteCodeWithConstructor =
        '608060405234801561001057600080fd5b506040516107413803806107418339810180604052604081101561003357600080fd5b81019080805164010000000081111561004b57600080fd5b8281019050602081018481111561006157600080fd5b815185600182028301116401000000008211171561007e57600080fd5b5050929190602001805164010000000081111561009a57600080fd5b828101905060208101848111156100b057600080fd5b81518560018202830111640100000000821117156100cd57600080fd5b50509291905050506100e582826100ec60201b60201c565b5050610213565b806000836040518082805190602001908083835b602083106101235780518252602082019150602081019050602083039250610100565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020908051906020019061016992919061016e565b505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106101af57805160ff19168380011785556101dd565b828001600101855582156101dd579182015b828111156101dc5782518255916020019190600101906101c1565b5b5090506101ea91906101ee565b5090565b61021091905b8082111561020c5760008160009055506001016101f4565b5090565b90565b61051f806102226000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063693ec85e1461003b578063e942b5161461016f575b600080fd5b6100f46004803603602081101561005157600080fd5b810190808035906020019064010000000081111561006e57600080fd5b82018360208201111561008057600080fd5b803590602001918460018302840111640100000000831117156100a257600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506102c1565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610134578082015181840152602081019050610119565b50505050905090810190601f1680156101615780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102bf6004803603604081101561018557600080fd5b81019080803590602001906401000000008111156101a257600080fd5b8201836020820111156101b457600080fd5b803590602001918460018302840111640100000000831117156101d657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561023957600080fd5b82018360208201111561024b57600080fd5b8035906020019184600183028401116401000000008311171561026d57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506103cc565b005b60606000826040518082805190602001908083835b602083106102f957805182526020820191506020810190506020830392506102d6565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156103c05780601f10610395576101008083540402835291602001916103c0565b820191906000526020600020905b8154815290600101906020018083116103a357829003601f168201915b50505050509050919050565b806000836040518082805190602001908083835b6020831061040357805182526020820191506020810190506020830392506103e0565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020908051906020019061044992919061044e565b505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061048f57805160ff19168380011785556104bd565b828001600101855582156104bd579182015b828111156104bc5782518255916020019190600101906104a1565b5b5090506104ca91906104ce565b5090565b6104f091905b808211156104ec5760008160009055506001016104d4565b5090565b9056fea165627a7a7230582025d50863c1fea84c9ea588d75b7fdab2de3a9b9fb3bc0b58ec83b3259c04285d0029'
    const abiWithConstructor = [
        {
            constant: true,
            inputs: [{ name: 'key', type: 'string' }],
            name: 'get',
            outputs: [{ name: '', type: 'string' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: false,
            inputs: [{ name: 'key', type: 'string' }, { name: 'value', type: 'string' }],
            name: 'set',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ name: 'key', type: 'string' }, { name: 'value', type: 'string' }],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'constructor',
        },
    ]

    const contractDeployFormatter = receipt => {
        return receipt
    }

    context('Basic transaction via caver.contract (TxTypeSmartContractDeploy/TxTypeSmartContractExecution)', () => {
        it('CAVERJS-UNIT-ETC-267: contract.deploy({ data }).send({ from, ... }) deploys contract', async () => {
            const contract = new caver.contract(abiWithoutConstructor)
            const deployed = await contract.deploy({ data: byteCodeWithoutConstructor }).send({
                from: sender.address,
                gas: 1000000,
                contractDeployFormatter,
            })

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)
        }).timeout(200000)

        it('CAVERJS-UNIT-ETC-268: contract.deploy({ data, arguments }).send({ from, ... }) deploys contract', async () => {
            const contract = new caver.contract(abiWithConstructor)

            keyString = 'keyString'
            valueString = 'valueString'

            const deployed = await contract
                .deploy({
                    data: byteCodeWithConstructor,
                    arguments: [keyString, valueString],
                })
                .send({
                    from: sender.address,
                    gas: 100000000,
                    contractDeployFormatter,
                })

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)

            contractAddress = deployed.contractAddress
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-269: contract.methods['constructor'](byteCode).send({ from, ... }) deploys contract`, async () => {
            const contract = new caver.contract(abiWithoutConstructor)

            // contract.methods['constructor'] formatted to contract.methods.constructor by linter
            // So eslint disable comment have to be added to block formatting
            // eslint-disable-next-line dot-notation
            const deployed = await contract.methods['constructor'](byteCodeWithoutConstructor).send({
                from: sender.address,
                gas: 1000000,
                contractDeployFormatter,
            })

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-270: contract.methods['constructor'](byteCode, arguments).send({ from, ... }) deploys contract`, async () => {
            const contract = new caver.contract(abiWithConstructor)

            // contract.methods['constructor'] formatted to contract.methods.constructor by linter
            // So eslint disable comment have to be added to block formatting
            // eslint-disable-next-line dot-notation
            const deployed = await contract.methods['constructor'](byteCodeWithConstructor, 'keykey', 'valuevalue').send({
                from: sender.address,
                gas: 100000000,
                contractDeployFormatter,
            })

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-271: contract.methods.constructor(byteCode).send({ from, ... }) deploys contract`, async () => {
            const contract = new caver.contract(abiWithoutConstructor)

            const deployed = await contract.methods.constructor(byteCodeWithoutConstructor).send({
                from: sender.address,
                gas: 1000000,
                contractDeployFormatter,
            })

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-272: contract.methods.constructor(byteCode, arguments).send({ from, ... }) deploys contract`, async () => {
            const contract = new caver.contract(abiWithoutConstructor)

            const deployed = await contract.methods.constructor(byteCodeWithConstructor, 'thisIsKeyString', 'thisIsValueString').send({
                from: sender.address,
                gas: 1000000,
                contractDeployFormatter,
            })

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-273: contract.deploy({ from, ... }, byteCode) deploys contract`, async () => {
            const contract = new caver.contract(abiWithoutConstructor)
            const deployed = await contract.deploy(
                {
                    from: sender.address,
                    gas: 1000000,
                    contractDeployFormatter,
                },
                byteCodeWithoutConstructor
            )

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-274: contract.deploy({ from, ... }, byteCode, arguements) deploys contract`, async () => {
            const contract = new caver.contract(abiWithConstructor)
            const deployed = await contract.deploy(
                {
                    from: sender.address,
                    gas: 100000000,
                    contractDeployFormatter,
                },
                byteCodeWithConstructor,
                'keykey',
                'valuevalue'
            )

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-275: contract.methods.get(arguments).call({ ... }) will call the contract`, async () => {
            const contract = new caver.contract(abiWithConstructor, contractAddress)
            const result = await contract.methods.get(keyString).call({ from: sender.address })

            expect(result).to.equal(valueString)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-276: contract.methods['get'].call({ ... }) will call the contract`, async () => {
            const contract = new caver.contract(abiWithConstructor, contractAddress)

            // contract.methods['get'] formatted to contract.methods.get by linter
            // So eslint disable comment have to be added to block formatting
            // eslint-disable-next-line dot-notation
            const result = await contract.methods['get'](keyString).call({ from: sender.address })

            expect(result).to.equal(valueString)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-277: contract.call({ ... }, functionName, arguments) will call the contract`, async () => {
            const contract = new caver.contract(abiWithConstructor, contractAddress)

            const result = await contract.call({ from: sender.address }, 'get', keyString)

            expect(result).to.equal(valueString)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-278: contract.call(functionName, arguments) will call the contract`, async () => {
            const contract = new caver.contract(abiWithConstructor, contractAddress)

            const result = await contract.call('get', keyString)

            expect(result).to.equal(valueString)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-279: contract.methods.set(arguments).send({ ... }) will execute the contract`, async () => {
            const contract = new caver.contract(abiWithConstructor, contractAddress)

            const newKey = 'jasmine'
            const newValue = 'valuable'
            const result = await contract.methods.set(newKey, newValue).send({
                from: sender.address,
                gas: 1000000,
            })
            expect(result.from).to.equal(sender.address)
            expect(result.status).to.be.true
            expect(result.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractExecution)

            const value = await contract.methods.get(newKey).call({ from: sender.address })
            expect(value).to.equal(newValue)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-280: contract.methods['set'](arguments).send({ ... }) will execute the contract`, async () => {
            const contract = new caver.contract(abiWithConstructor, contractAddress)

            const newKey = 'caver-js'
            const newValue = 'so nice'

            // contract.methods['set'] formatted to contract.methods.set by linter
            // So eslint disable comment have to be added to block formatting
            // eslint-disable-next-line dot-notation
            const result = await contract.methods['set'](newKey, newValue).send({
                from: sender.address,
                gas: 1000000,
            })
            expect(result.from).to.equal(sender.address)
            expect(result.status).to.be.true
            expect(result.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractExecution)

            // eslint-disable-next-line dot-notation
            const value = await contract.methods['get'](newKey).call({ from: sender.address })
            expect(value).to.equal(newValue)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-281: contract.send({ ... }, functionName, arguments) will execute the contract`, async () => {
            const contract = new caver.contract(abiWithConstructor, contractAddress)

            const newKey = 'contract'
            const newValue = 'so convenient'

            const result = await contract.send(
                {
                    from: sender.address,
                    gas: 1000000,
                },
                'set',
                newKey,
                newValue
            )
            expect(result.from).to.equal(sender.address)
            expect(result.status).to.be.true
            expect(result.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractExecution)

            const value = await contract.call('get', newKey)
            expect(value).to.equal(newValue)
        }).timeout(200000)
    })

    context(
        'Fee Delegation transaction via caver.contract (TxTypeFeeDelegatedSmartContractDeploy/TxTypeFeeDelegatedSmartContractExecution)',
        () => {
            it('CAVERJS-UNIT-ETC-282: contract.deploy({ data }).send({ from, feeDelegation: true, feePayer, ... }) deploys contract', async () => {
                const contract = new caver.contract(abiWithoutConstructor)
                const deployed = await contract.deploy({ data: byteCodeWithoutConstructor }).send({
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    gas: 1000000,
                    contractDeployFormatter,
                })

                expect(deployed.from).to.equal(sender.address)
                expect(deployed.feePayer).to.equal(feePayer.address)
                expect(deployed.status).to.be.true
                expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it('CAVERJS-UNIT-ETC-283: contract.deploy({ data, arguments }).send({ from, feeDelegation: true, feePayer, ... }) deploys contract', async () => {
                const contract = new caver.contract(abiWithConstructor)

                keyString = 'keyString'
                valueString = 'valueString'

                const deployed = await contract
                    .deploy({
                        data: byteCodeWithConstructor,
                        arguments: [keyString, valueString],
                    })
                    .send({
                        from: sender.address,
                        feeDelegation: true,
                        feePayer: feePayer.address,
                        gas: 100000000,
                        contractDeployFormatter,
                    })

                expect(deployed.from).to.equal(sender.address)
                expect(deployed.feePayer).to.equal(feePayer.address)
                expect(deployed.status).to.be.true
                expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

                contractAddress = deployed.contractAddress
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-284: contract.methods['constructor'](byteCode).send({ from, feeDelegation: true, feePayer, ... }) deploys contract`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                // contract.methods['constructor'] formatted to contract.methods.constructor by linter
                // So eslint disable comment have to be added to block formatting
                // eslint-disable-next-line dot-notation
                const deployed = await contract.methods['constructor'](byteCodeWithoutConstructor).send({
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    gas: 1000000,
                    contractDeployFormatter,
                })

                expect(deployed.from).to.equal(sender.address)
                expect(deployed.feePayer).to.equal(feePayer.address)
                expect(deployed.status).to.be.true
                expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-285: contract.methods['constructor'](byteCode, arguments).send({ from, feeDelegation: true, feePayer, ... }) deploys contract`, async () => {
                const contract = new caver.contract(abiWithConstructor)

                // contract.methods['constructor'] formatted to contract.methods.constructor by linter
                // So eslint disable comment have to be added to block formatting
                // eslint-disable-next-line dot-notation
                const deployed = await contract.methods['constructor'](byteCodeWithConstructor, 'keykey', 'valuevalue').send({
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    gas: 100000000,
                    contractDeployFormatter,
                })

                expect(deployed.from).to.equal(sender.address)
                expect(deployed.feePayer).to.equal(feePayer.address)
                expect(deployed.status).to.be.true
                expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-286: contract.methods.constructor(byteCode).send({ from, feeDelegation: true, feePayer, ... }) deploys contract`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                const deployed = await contract.methods.constructor(byteCodeWithoutConstructor).send({
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    gas: 1000000,
                    contractDeployFormatter,
                })

                expect(deployed.from).to.equal(sender.address)
                expect(deployed.feePayer).to.equal(feePayer.address)
                expect(deployed.status).to.be.true
                expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-287: contract.methods.constructor(byteCode, arguments).send({ from, feeDelegation: true, feePayer, ... }) deploys contract`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                const deployed = await contract.methods.constructor(byteCodeWithConstructor, 'thisIsKeyString', 'thisIsValueString').send({
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    gas: 1000000,
                    contractDeployFormatter,
                })

                expect(deployed.from).to.equal(sender.address)
                expect(deployed.feePayer).to.equal(feePayer.address)
                expect(deployed.status).to.be.true
                expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-288: contract.deploy({ from, feeDelegation: true, feePayer, ... }, byteCode) deploys contract`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)
                const deployed = await contract.deploy(
                    {
                        from: sender.address,
                        feeDelegation: true,
                        feePayer: feePayer.address,
                        gas: 1000000,
                        contractDeployFormatter,
                    },
                    byteCodeWithoutConstructor
                )

                expect(deployed.from).to.equal(sender.address)
                expect(deployed.feePayer).to.equal(feePayer.address)
                expect(deployed.status).to.be.true
                expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-289: contract.deploy({ from, feeDelegation: true, feePayer, ... }, byteCode, arguements) deploys contract`, async () => {
                const contract = new caver.contract(abiWithConstructor)
                const deployed = await contract.deploy(
                    {
                        from: sender.address,
                        feeDelegation: true,
                        feePayer: feePayer.address,
                        gas: 100000000,
                        contractDeployFormatter,
                    },
                    byteCodeWithConstructor,
                    'keykey',
                    'valuevalue'
                )

                expect(deployed.from).to.equal(sender.address)
                expect(deployed.feePayer).to.equal(feePayer.address)
                expect(deployed.status).to.be.true
                expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-290: contract.methods.set(arguments).send({ from, feeDelegation: true, feePayer, ... }) will execute the contract`, async () => {
                const contract = new caver.contract(abiWithConstructor, contractAddress)

                const newKey = 'jasmine'
                const newValue = 'valuable'
                const result = await contract.methods.set(newKey, newValue).send({
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    gas: 1000000,
                })
                expect(result.from).to.equal(sender.address)
                expect(result.status).to.be.true
                expect(result.feePayer).to.equal(feePayer.address)
                expect(result.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

                const value = await contract.methods.get(newKey).call({ from: sender.address })
                expect(value).to.equal(newValue)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-291: contract.methods['set'](arguments).send({ from, feeDelegation: true, feePayer, ... }) will execute the contract`, async () => {
                const contract = new caver.contract(abiWithConstructor, contractAddress)

                const newKey = 'caver-js'
                const newValue = 'so nice'

                // contract.methods['set'] formatted to contract.methods.set by linter
                // So eslint disable comment have to be added to block formatting
                // eslint-disable-next-line dot-notation
                const result = await contract.methods['set'](newKey, newValue).send({
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    gas: 1000000,
                })
                expect(result.from).to.equal(sender.address)
                expect(result.status).to.be.true
                expect(result.feePayer).to.equal(feePayer.address)
                expect(result.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

                // eslint-disable-next-line dot-notation
                const value = await contract.methods['get'](newKey).call({ from: sender.address })
                expect(value).to.equal(newValue)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-292: contract.send({ from, feeDelegation: true, feePayer, ... }, functionName, arguments) will execute the contract`, async () => {
                const contract = new caver.contract(abiWithConstructor, contractAddress)

                const newKey = 'contract'
                const newValue = 'so convenient'

                const result = await contract.send(
                    {
                        from: sender.address,
                        feeDelegation: true,
                        feePayer: feePayer.address,
                        gas: 1000000,
                    },
                    'set',
                    newKey,
                    newValue
                )
                expect(result.from).to.equal(sender.address)
                expect(result.status).to.be.true
                expect(result.feePayer).to.equal(feePayer.address)
                expect(result.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

                const value = await contract.call('get', newKey)
                expect(value).to.equal(newValue)
            }).timeout(200000)
        }
    )

    context(
        'Partial Fee Delegation transaction via caver.contract (TxTypeFeeDelegatedSmartContractDeployWithRatio/TxTypeFeeDelegatedSmartContractExecutionWithRatio)',
        () => {
            it('CAVERJS-UNIT-ETC-293: contract.deploy({ data }).send({ from, feeDelegation: true, feePayer, feeRatio, ... }) deploys contract', async () => {
                const contract = new caver.contract(abiWithoutConstructor)
                const deployed = await contract.deploy({ data: byteCodeWithoutConstructor }).send({
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    feeRatio: 30,
                    gas: 1000000,
                    contractDeployFormatter,
                })

                expect(deployed.from).to.equal(sender.address)
                expect(deployed.feePayer).to.equal(feePayer.address)
                expect(deployed.status).to.be.true
                expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it('CAVERJS-UNIT-ETC-294: contract.deploy({ data, arguments }).send({ from, feeDelegation: true, feePayer, feeRatio, ... }) deploys contract', async () => {
                const contract = new caver.contract(abiWithConstructor)

                keyString = 'keyString'
                valueString = 'valueString'

                const deployed = await contract
                    .deploy({
                        data: byteCodeWithConstructor,
                        arguments: [keyString, valueString],
                    })
                    .send({
                        from: sender.address,
                        feeDelegation: true,
                        feePayer: feePayer.address,
                        feeRatio: 30,
                        gas: 100000000,
                        contractDeployFormatter,
                    })

                expect(deployed.from).to.equal(sender.address)
                expect(deployed.feePayer).to.equal(feePayer.address)
                expect(deployed.status).to.be.true
                expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)

                contractAddress = deployed.contractAddress
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-295: contract.methods['constructor'](byteCode).send({ from, feeDelegation: true, feePayer, feeRatio, ... }) deploys contract`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                // contract.methods['constructor'] formatted to contract.methods.constructor by linter
                // So eslint disable comment have to be added to block formatting
                // eslint-disable-next-line dot-notation
                const deployed = await contract.methods['constructor'](byteCodeWithoutConstructor).send({
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    feeRatio: 30,
                    gas: 1000000,
                    contractDeployFormatter,
                })

                expect(deployed.from).to.equal(sender.address)
                expect(deployed.feePayer).to.equal(feePayer.address)
                expect(deployed.status).to.be.true
                expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-296: contract.methods['constructor'](byteCode, arguments).send({ from, feeDelegation: true, feePayer, feeRatio, ... }) deploys contract`, async () => {
                const contract = new caver.contract(abiWithConstructor)

                // contract.methods['constructor'] formatted to contract.methods.constructor by linter
                // So eslint disable comment have to be added to block formatting
                // eslint-disable-next-line dot-notation
                const deployed = await contract.methods['constructor'](byteCodeWithConstructor, 'keykey', 'valuevalue').send({
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    feeRatio: 30,
                    gas: 100000000,
                    contractDeployFormatter,
                })

                expect(deployed.from).to.equal(sender.address)
                expect(deployed.feePayer).to.equal(feePayer.address)
                expect(deployed.status).to.be.true
                expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-297: contract.methods.constructor(byteCode).send({ from, feeDelegation: true, feePayer, feeRatio, ... }) deploys contract`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                const deployed = await contract.methods.constructor(byteCodeWithoutConstructor).send({
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    feeRatio: 30,
                    gas: 1000000,
                    contractDeployFormatter,
                })

                expect(deployed.from).to.equal(sender.address)
                expect(deployed.feePayer).to.equal(feePayer.address)
                expect(deployed.status).to.be.true
                expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-298: contract.methods.constructor(byteCode, arguments).send({ from, feeDelegation: true, feePayer, feeRatio, ... }) deploys contract`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                const deployed = await contract.methods.constructor(byteCodeWithConstructor, 'thisIsKeyString', 'thisIsValueString').send({
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    feeRatio: 30,
                    gas: 1000000,
                    contractDeployFormatter,
                })

                expect(deployed.from).to.equal(sender.address)
                expect(deployed.feePayer).to.equal(feePayer.address)
                expect(deployed.status).to.be.true
                expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-299: contract.deploy({ from, feeDelegation: true, feePayer, feeRatio, ... }, byteCode) deploys contract`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)
                const deployed = await contract.deploy(
                    {
                        from: sender.address,
                        feeDelegation: true,
                        feePayer: feePayer.address,
                        feeRatio: 30,
                        gas: 1000000,
                        contractDeployFormatter,
                    },
                    byteCodeWithoutConstructor
                )

                expect(deployed.from).to.equal(sender.address)
                expect(deployed.feePayer).to.equal(feePayer.address)
                expect(deployed.status).to.be.true
                expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-300: contract.deploy({ from, feeDelegation: true, feePayer, feeRatio, ... }, byteCode, arguements) deploys contract`, async () => {
                const contract = new caver.contract(abiWithConstructor)
                const deployed = await contract.deploy(
                    {
                        from: sender.address,
                        feeDelegation: true,
                        feePayer: feePayer.address,
                        feeRatio: 30,
                        gas: 100000000,
                        contractDeployFormatter,
                    },
                    byteCodeWithConstructor,
                    'keykey',
                    'valuevalue'
                )

                expect(deployed.from).to.equal(sender.address)
                expect(deployed.feePayer).to.equal(feePayer.address)
                expect(deployed.status).to.be.true
                expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-301: contract.methods.set(arguments).send({ from, feeDelegation: true, feePayer, feeRatio, ... }) will execute the contract`, async () => {
                const contract = new caver.contract(abiWithConstructor, contractAddress)

                const newKey = 'jasmine'
                const newValue = 'valuable'
                const result = await contract.methods.set(newKey, newValue).send({
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    feeRatio: 30,
                    gas: 1000000,
                })
                expect(result.from).to.equal(sender.address)
                expect(result.status).to.be.true
                expect(result.feePayer).to.equal(feePayer.address)
                expect(result.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)

                const value = await contract.methods.get(newKey).call({ from: sender.address })
                expect(value).to.equal(newValue)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-302: contract.methods['set'](arguments).send({ from, feeDelegation: true, feePayer, feeRatio, ... }) will execute the contract`, async () => {
                const contract = new caver.contract(abiWithConstructor, contractAddress)

                const newKey = 'caver-js'
                const newValue = 'so nice'

                // contract.methods['set'] formatted to contract.methods.set by linter
                // So eslint disable comment have to be added to block formatting
                // eslint-disable-next-line dot-notation
                const result = await contract.methods['set'](newKey, newValue).send({
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    feeRatio: 30,
                    gas: 1000000,
                })
                expect(result.from).to.equal(sender.address)
                expect(result.status).to.be.true
                expect(result.feePayer).to.equal(feePayer.address)
                expect(result.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)

                // eslint-disable-next-line dot-notation
                const value = await contract.methods['get'](newKey).call({ from: sender.address })
                expect(value).to.equal(newValue)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-303: contract.send({ from, feeDelegation: true, feePayer, feeRatio, ... }, functionName, arguments) will execute the contract`, async () => {
                const contract = new caver.contract(abiWithConstructor, contractAddress)

                const newKey = 'contract'
                const newValue = 'so convenient'

                const result = await contract.send(
                    {
                        from: sender.address,
                        feeDelegation: true,
                        feePayer: feePayer.address,
                        feeRatio: 30,
                        gas: 1000000,
                    },
                    'set',
                    newKey,
                    newValue
                )
                expect(result.from).to.equal(sender.address)
                expect(result.status).to.be.true
                expect(result.feePayer).to.equal(feePayer.address)
                expect(result.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)

                const value = await contract.call('get', newKey)
                expect(value).to.equal(newValue)
            }).timeout(200000)
        }
    )

    context('Sign the Basic transaction via caver.contract (TxTypeSmartContractDeploy/TxTypeSmartContractExecution)', () => {
        it(`CAVERJS-UNIT-ETC-304: contract.deploy({ data }).sign({ from, ... }) will create a transaction and sign the transaction as a sender`, async () => {
            const contract = new caver.contract(abiWithoutConstructor)

            const signed = await contract.deploy({ data: byteCodeWithoutConstructor }).sign({
                from: sender.address,
                gas: 1000000,
            })

            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)

            const receipt = await caver.rpc.klay.sendRawTransaction(signed)

            expect(receipt.from).to.equal(sender.address)
            expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
            expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-305: contract.deploy({ data, arguments }).sign({ from, ... }) will create a transaction and sign the transaction as a sender`, async () => {
            const contract = new caver.contract(abiWithConstructor)

            const signed = await contract
                .deploy({
                    data: byteCodeWithConstructor,
                    arguments: [keyString, valueString],
                })
                .sign({
                    from: sender.address,
                    gas: 1000000,
                })

            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)

            const receipt = await caver.rpc.klay.sendRawTransaction(signed)

            expect(receipt.from).to.equal(sender.address)
            expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
            expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-306: contract.methods['constructor'](byteCode).sign({ from, ... }) will create a transaction and sign the transaction as a sender`, async () => {
            const contract = new caver.contract(abiWithoutConstructor)

            // contract.methods['constructor'] formatted to contract.methods.constructor by linter
            // So eslint disable comment have to be added to block formatting
            // eslint-disable-next-line dot-notation
            const signed = await contract.methods['constructor'](byteCodeWithoutConstructor).sign({
                from: sender.address,
                gas: 1000000,
            })

            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)

            const receipt = await caver.rpc.klay.sendRawTransaction(signed)

            expect(receipt.from).to.equal(sender.address)
            expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
            expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-307: contract.methods['constructor'](byteCode, arguments).sign({ from, ... }) will create a transaction and sign the transaction as a sender`, async () => {
            const contract = new caver.contract(abiWithConstructor)

            // contract.methods['constructor'] formatted to contract.methods.constructor by linter
            // So eslint disable comment have to be added to block formatting
            // eslint-disable-next-line dot-notation
            const signed = await contract.methods['constructor'](byteCodeWithConstructor, 'keykey', 'valuevalue').sign({
                from: sender.address,
                gas: 1000000,
            })

            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)

            const receipt = await caver.rpc.klay.sendRawTransaction(signed)

            expect(receipt.from).to.equal(sender.address)
            expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
            expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-308: contract.methods.constructor(byteCode).sign({ from, ... }) will create a transaction and sign the transaction as a sender`, async () => {
            const contract = new caver.contract(abiWithoutConstructor)

            const signed = await contract.methods.constructor(byteCodeWithoutConstructor).sign({
                from: sender.address,
                gas: 1000000,
            })

            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)

            const receipt = await caver.rpc.klay.sendRawTransaction(signed)

            expect(receipt.from).to.equal(sender.address)
            expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
            expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-309: contract.methods.constructor(byteCode, arguments).sign({ from, ... }) will create a transaction and sign the transaction as a sender`, async () => {
            const contract = new caver.contract(abiWithConstructor)

            const signed = await contract.methods.constructor(byteCodeWithConstructor, 'keyStr', 'valueStr').sign({
                from: sender.address,
                gas: 1000000,
            })

            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)

            const receipt = await caver.rpc.klay.sendRawTransaction(signed)

            expect(receipt.from).to.equal(sender.address)
            expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
            expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-310: contract.sign({ from, ... }, 'constructor', byteCode) will create a transaction and sign the transaction as a sender`, async () => {
            const contract = new caver.contract(abiWithoutConstructor)

            const signed = await contract.sign(
                {
                    from: sender.address,
                    gas: 1000000,
                },
                'constructor',
                byteCodeWithoutConstructor
            )

            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)

            const receipt = await caver.rpc.klay.sendRawTransaction(signed)

            expect(receipt.from).to.equal(sender.address)
            expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
            expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-311: contract.sign({ from, ... }, 'constructor', byteCode, arguments) will create a transaction and sign the transaction as a sender`, async () => {
            const contract = new caver.contract(abiWithConstructor)

            const signed = await contract.sign(
                {
                    from: sender.address,
                    gas: 1000000,
                },
                'constructor',
                byteCodeWithConstructor,
                'keyForSign',
                'valueForSign'
            )

            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)

            const receipt = await caver.rpc.klay.sendRawTransaction(signed)

            expect(receipt.from).to.equal(sender.address)
            expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
            expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractDeploy)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-312: contract.methods.set(arguments).sign({ from, ... }) will create a transaction and sign the transaction as a sender`, async () => {
            const contract = new caver.contract(abiWithConstructor, contractAddress)

            const newKey = 'contract'
            const newValue = 'testing'
            const signed = await contract.methods.set(newKey, newValue).sign({
                from: sender.address,
                gas: 1000000,
            })

            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractExecution)

            const receipt = await caver.rpc.klay.sendRawTransaction(signed)

            expect(receipt.from).to.equal(sender.address)
            expect(receipt.to.toLowerCase()).to.equal(contractAddress.toLowerCase())
            expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractExecution)

            const value = await contract.methods.get(newKey).call({ from: sender.address })
            expect(value).to.equal(newValue)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-313: contract.methods['set'](arguments).sign({ from, ... }) will create a transaction and sign the transaction as a sender`, async () => {
            const contract = new caver.contract(abiWithConstructor, contractAddress)

            const newKey = 'how are you'
            const newValue = 'im fine'

            // contract.methods['set'] formatted to contract.methods.set by linter
            // So eslint disable comment have to be added to block formatting
            // eslint-disable-next-line dot-notation
            const signed = await contract.methods['set'](newKey, newValue).sign({
                from: sender.address,
                gas: 1000000,
            })

            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractExecution)

            const receipt = await caver.rpc.klay.sendRawTransaction(signed)

            expect(receipt.from).to.equal(sender.address)
            expect(receipt.to.toLowerCase()).to.equal(contractAddress.toLowerCase())
            expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractExecution)

            const value = await contract.methods.get(newKey).call({ from: sender.address })
            expect(value).to.equal(newValue)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-314: contract.sign({ from, ... }, functionName, arguments) will create a transaction and sign the transaction as a sender`, async () => {
            const contract = new caver.contract(abiWithoutConstructor, contractAddress)

            const newKey = 'contract sign func'
            const newValue = 'should return signed tx'

            const signed = await contract.sign(
                {
                    from: sender.address,
                    gas: 1000000,
                },
                'set',
                newKey,
                newValue
            )

            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractExecution)

            const receipt = await caver.rpc.klay.sendRawTransaction(signed)

            expect(receipt.from).to.equal(sender.address)
            expect(receipt.to.toLowerCase()).to.equal(contractAddress.toLowerCase())
            expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractExecution)

            const value = await contract.methods.get(newKey).call({ from: sender.address })
            expect(value).to.equal(newValue)
        }).timeout(200000)
    })

    context(
        'Sign the Fee Delegation transaction via caver.contract (TxTypeFeeDelegatedSmartContractDeploy/TxTypeFeeDelegatedSmartContractExecution)',
        () => {
            it(`CAVERJS-UNIT-ETC-315: contract.deploy({ data }).sign({ from, feeDelegation: true, ... }) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                const signed = await contract.deploy({ data: byteCodeWithoutConstructor }).sign({
                    from: sender.address,
                    feeDelegation: true,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-316: contract.deploy({ data, arguments }).sign({ from, feeDelegation: true, ... }) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithConstructor)

                const signed = await contract
                    .deploy({
                        data: byteCodeWithConstructor,
                        arguments: [keyString, valueString],
                    })
                    .sign({
                        from: sender.address,
                        feeDelegation: true,
                        gas: 1000000,
                    })

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-317: contract.methods['constructor'](byteCode).sign({ from, feeDelegation: true,  ... }) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                // contract.methods['constructor'] formatted to contract.methods.constructor by linter
                // So eslint disable comment have to be added to block formatting
                // eslint-disable-next-line dot-notation
                const signed = await contract.methods['constructor'](byteCodeWithoutConstructor).sign({
                    from: sender.address,
                    feeDelegation: true,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-318: contract.methods['constructor'](byteCode, arguments).sign({ from, feeDelegation: true, ... }) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithConstructor)

                // contract.methods['constructor'] formatted to contract.methods.constructor by linter
                // So eslint disable comment have to be added to block formatting
                // eslint-disable-next-line dot-notation
                const signed = await contract.methods['constructor'](byteCodeWithConstructor, 'keykey', 'valuevalue').sign({
                    from: sender.address,
                    feeDelegation: true,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-319: contract.methods.constructor(byteCode).sign({ from, feeDelegation: true, ... }) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                const signed = await contract.methods.constructor(byteCodeWithoutConstructor).sign({
                    from: sender.address,
                    feeDelegation: true,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-320: contract.methods.constructor(byteCode, arguments).sign({ from, feeDelegation: true, ... }) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithConstructor)

                const signed = await contract.methods.constructor(byteCodeWithConstructor, 'k', 'v').sign({
                    from: sender.address,
                    feeDelegation: true,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-321: contract.sign({ from, feeDelegation: true, ... }, 'constructor', byteCode) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                const signed = await contract.sign(
                    {
                        from: sender.address,
                        feeDelegation: true,
                        gas: 1000000,
                    },
                    'constructor',
                    byteCodeWithoutConstructor
                )

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-322: contract.sign({ from, feeDelegation: true, ... }, 'constructor', byteCode, arguments) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithConstructor)

                const signed = await contract.sign(
                    {
                        from: sender.address,
                        feeDelegation: true,
                        gas: 1000000,
                    },
                    'constructor',
                    byteCodeWithConstructor,
                    'keyForSign',
                    'valueForSign'
                )

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-323: contract.methods.set(arguments).sign({ from, feeDelegation: true, ... }) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithConstructor, contractAddress)

                const newKey = 'contract'
                const newValue = 'testing'
                const signed = await contract.methods.set(newKey, newValue).sign({
                    from: sender.address,
                    feeDelegation: true,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(receipt.to.toLowerCase()).to.equal(contractAddress.toLowerCase())
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

                const value = await contract.methods.get(newKey).call({ from: sender.address })
                expect(value).to.equal(newValue)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-324: contract.methods['set'](arguments).sign({ from, feeDelegation: true, ... }) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithConstructor, contractAddress)

                const newKey = 'how are you'
                const newValue = 'im fine'

                // contract.methods['set'] formatted to contract.methods.set by linter
                // So eslint disable comment have to be added to block formatting
                // eslint-disable-next-line dot-notation
                const signed = await contract.methods['set'](newKey, newValue).sign({
                    from: sender.address,
                    feeDelegation: true,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(receipt.to.toLowerCase()).to.equal(contractAddress.toLowerCase())
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

                const value = await contract.methods.get(newKey).call({ from: sender.address })
                expect(value).to.equal(newValue)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-325: contract.sign({ from, feeDelegation: true, ... }, functionName, arguments) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithoutConstructor, contractAddress)

                const newKey = 'contract sign func'
                const newValue = 'should return signed tx'

                const signed = await contract.sign(
                    {
                        from: sender.address,
                        feeDelegation: true,
                        gas: 1000000,
                    },
                    'set',
                    newKey,
                    newValue
                )

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(receipt.to.toLowerCase()).to.equal(contractAddress.toLowerCase())
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

                const value = await contract.methods.get(newKey).call({ from: sender.address })
                expect(value).to.equal(newValue)
            }).timeout(200000)
        }
    )

    context(
        'Sign the Partial Fee Delegation transaction via caver.contract (TxTypeFeeDelegatedSmartContractDeployWithRatio/TxTypeFeeDelegatedSmartContractExecutionWithRatio)',
        () => {
            it(`CAVERJS-UNIT-ETC-326: contract.deploy({ data }).sign({ from, feeDelegation: true, feeRatio, ... }) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                const signed = await contract.deploy({ data: byteCodeWithoutConstructor }).sign({
                    from: sender.address,
                    feeDelegation: true,
                    feeRatio: 30,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-327: contract.deploy({ data, arguments }).sign({ from, feeDelegation: true, feeRatio, ... }) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithConstructor)

                const signed = await contract
                    .deploy({
                        data: byteCodeWithConstructor,
                        arguments: [keyString, valueString],
                    })
                    .sign({
                        from: sender.address,
                        feeDelegation: true,
                        feeRatio: 30,
                        gas: 1000000,
                    })

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-328: contract.methods['constructor'](byteCode).sign({ from, feeDelegation: true, feeRatio, ... }) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                // contract.methods['constructor'] formatted to contract.methods.constructor by linter
                // So eslint disable comment have to be added to block formatting
                // eslint-disable-next-line dot-notation
                const signed = await contract.methods['constructor'](byteCodeWithoutConstructor).sign({
                    from: sender.address,
                    feeDelegation: true,
                    feeRatio: 30,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-329: contract.methods['constructor'](byteCode, arguments).sign({ from, feeDelegation: true, feeRatio, ... }) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithConstructor)

                // contract.methods['constructor'] formatted to contract.methods.constructor by linter
                // So eslint disable comment have to be added to block formatting
                // eslint-disable-next-line dot-notation
                const signed = await contract.methods['constructor'](byteCodeWithConstructor, 'keykey', 'valuevalue').sign({
                    from: sender.address,
                    feeDelegation: true,
                    feeRatio: 30,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-330: contract.methods.constructor(byteCode).sign({ from, feeDelegation: true, feeRatio, ... }) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                const signed = await contract.methods.constructor(byteCodeWithoutConstructor).sign({
                    from: sender.address,
                    feeDelegation: true,
                    feeRatio: 30,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-331: contract.methods.constructor(byteCode, arguments).sign({ from, feeDelegation: true, feeRatio, ... }) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithConstructor)

                const signed = await contract.methods.constructor(byteCodeWithConstructor, 'k', 'v').sign({
                    from: sender.address,
                    feeDelegation: true,
                    feeRatio: 30,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-332: contract.sign({ from, feeDelegation: true, feeRatio, ... }, 'constructor', byteCode) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                const signed = await contract.sign(
                    {
                        from: sender.address,
                        feeDelegation: true,
                        feeRatio: 30,
                        gas: 1000000,
                    },
                    'constructor',
                    byteCodeWithoutConstructor
                )

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-333: contract.sign({ from, feeDelegation: true, feeRatio, ... }, 'constructor', byteCode, arguments) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithConstructor)

                const signed = await contract.sign(
                    {
                        from: sender.address,
                        feeDelegation: true,
                        feeRatio: 30,
                        gas: 1000000,
                    },
                    'constructor',
                    byteCodeWithConstructor,
                    'keyForSign',
                    'valueForSign'
                )

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-334: contract.methods.set(arguments).sign({ from, feeDelegation: true, feeRatio, ... }) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithConstructor, contractAddress)

                const newKey = 'contract'
                const newValue = 'testing'
                const signed = await contract.methods.set(newKey, newValue).sign({
                    from: sender.address,
                    feeDelegation: true,
                    feeRatio: 30,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(receipt.to.toLowerCase()).to.equal(contractAddress.toLowerCase())
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)

                const value = await contract.methods.get(newKey).call({ from: sender.address })
                expect(value).to.equal(newValue)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-335: contract.methods['set'](arguments).sign({ from, feeDelegation: true, feeRatio, ... }) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithConstructor, contractAddress)

                const newKey = 'how are you'
                const newValue = 'im fine'

                // contract.methods['set'] formatted to contract.methods.set by linter
                // So eslint disable comment have to be added to block formatting
                // eslint-disable-next-line dot-notation
                const signed = await contract.methods['set'](newKey, newValue).sign({
                    from: sender.address,
                    feeDelegation: true,
                    feeRatio: 30,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(receipt.to.toLowerCase()).to.equal(contractAddress.toLowerCase())
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)

                const value = await contract.methods.get(newKey).call({ from: sender.address })
                expect(value).to.equal(newValue)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-336: contract.sign({ from, feeDelegation: true, feeRatio, ... }, functionName, arguments) will create a transaction and sign the transaction as a sender`, async () => {
                const contract = new caver.contract(abiWithoutConstructor, contractAddress)

                const newKey = 'contract sign func'
                const newValue = 'should return signed tx'

                const signed = await contract.sign(
                    {
                        from: sender.address,
                        feeDelegation: true,
                        feeRatio: 30,
                        gas: 1000000,
                    },
                    'set',
                    newKey,
                    newValue
                )

                expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)

                await caver.wallet.signAsFeePayer(feePayer.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(receipt.to.toLowerCase()).to.equal(contractAddress.toLowerCase())
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)

                const value = await contract.methods.get(newKey).call({ from: sender.address })
                expect(value).to.equal(newValue)
            }).timeout(200000)
        }
    )

    context(
        'Sign as fee payer the Fee Delegation transaction via caver.contract (TxTypeFeeDelegatedSmartContractDeploy/TxTypeFeeDelegatedSmartContractExecution)',
        () => {
            it(`CAVERJS-UNIT-ETC-337: contract.deploy({ data }).signAsFeePayer({ from, feeDelegation: true, ... }) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                const signed = await contract.deploy({ data: byteCodeWithoutConstructor }).signAsFeePayer({
                    from: sender.address,
                    feePayer: feePayer.address,
                    feeDelegation: true,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-338: contract.deploy({ data, arguments }).signAsFeePayer({ from, feeDelegation: true, ... }) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithConstructor)

                const signed = await contract
                    .deploy({
                        data: byteCodeWithConstructor,
                        arguments: [keyString, valueString],
                    })
                    .signAsFeePayer({
                        from: sender.address,
                        feePayer: feePayer.address,
                        feeDelegation: true,
                        gas: 1000000,
                    })

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-339: contract.methods['constructor'](byteCode).signAsFeePayer({ from, feeDelegation: true,  ... }) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                // contract.methods['constructor'] formatted to contract.methods.constructor by linter
                // So eslint disable comment have to be added to block formatting
                // eslint-disable-next-line dot-notation
                const signed = await contract.methods['constructor'](byteCodeWithoutConstructor).signAsFeePayer({
                    from: sender.address,
                    feePayer: feePayer.address,
                    feeDelegation: true,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-340: contract.methods['constructor'](byteCode, arguments).signAsFeePayer({ from, feeDelegation: true, ... }) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithConstructor)

                // contract.methods['constructor'] formatted to contract.methods.constructor by linter
                // So eslint disable comment have to be added to block formatting
                // eslint-disable-next-line dot-notation
                const signed = await contract.methods['constructor'](byteCodeWithConstructor, 'keykey', 'valuevalue').signAsFeePayer({
                    from: sender.address,
                    feePayer: feePayer.address,
                    feeDelegation: true,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-341: contract.methods.constructor(byteCode).signAsFeePayer({ from, feeDelegation: true, ... }) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                const signed = await contract.methods.constructor(byteCodeWithoutConstructor).signAsFeePayer({
                    from: sender.address,
                    feePayer: feePayer.address,
                    feeDelegation: true,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-342: contract.methods.constructor(byteCode, arguments).signAsFeePayer({ from, feeDelegation: true, ... }) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithConstructor)

                const signed = await contract.methods.constructor(byteCodeWithConstructor, 'k', 'v').signAsFeePayer({
                    from: sender.address,
                    feePayer: feePayer.address,
                    feeDelegation: true,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-343: contract.signAsFeePayer({ from, feeDelegation: true, ... }, 'constructor', byteCode) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                const signed = await contract.signAsFeePayer(
                    {
                        from: sender.address,
                        feePayer: feePayer.address,
                        feeDelegation: true,
                        gas: 1000000,
                    },
                    'constructor',
                    byteCodeWithoutConstructor
                )

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-344: contract.signAsFeePayer({ from, feeDelegation: true, ... }, 'constructor', byteCode, arguments) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithConstructor)

                const signed = await contract.signAsFeePayer(
                    {
                        from: sender.address,
                        feePayer: feePayer.address,
                        feeDelegation: true,
                        gas: 1000000,
                    },
                    'constructor',
                    byteCodeWithConstructor,
                    'keyForSign',
                    'valueForSign'
                )

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-345: contract.methods.set(arguments).signAsFeePayer({ from, feeDelegation: true, ... }) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithConstructor, contractAddress)

                const newKey = 'contract'
                const newValue = 'testing'
                const signed = await contract.methods.set(newKey, newValue).signAsFeePayer({
                    from: sender.address,
                    feePayer: feePayer.address,
                    feeDelegation: true,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(receipt.to.toLowerCase()).to.equal(contractAddress.toLowerCase())
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

                const value = await contract.methods.get(newKey).call({ from: sender.address })
                expect(value).to.equal(newValue)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-346: contract.methods['set'](arguments).signAsFeePayer({ from, feeDelegation: true, ... }) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithConstructor, contractAddress)

                const newKey = 'how are you'
                const newValue = 'im fine'

                // contract.methods['set'] formatted to contract.methods.set by linter
                // So eslint disable comment have to be added to block formatting
                // eslint-disable-next-line dot-notation
                const signed = await contract.methods['set'](newKey, newValue).signAsFeePayer({
                    from: sender.address,
                    feePayer: feePayer.address,
                    feeDelegation: true,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(receipt.to.toLowerCase()).to.equal(contractAddress.toLowerCase())
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

                const value = await contract.methods.get(newKey).call({ from: sender.address })
                expect(value).to.equal(newValue)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-347: contract.signAsFeePayer({ from, feeDelegation: true, ... }, functionName, arguments) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithoutConstructor, contractAddress)

                const newKey = 'contract sign func'
                const newValue = 'should return signed tx'

                const signed = await contract.signAsFeePayer(
                    {
                        from: sender.address,
                        feePayer: feePayer.address,
                        feeDelegation: true,
                        gas: 1000000,
                    },
                    'set',
                    newKey,
                    newValue
                )

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(receipt.to.toLowerCase()).to.equal(contractAddress.toLowerCase())
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

                const value = await contract.methods.get(newKey).call({ from: sender.address })
                expect(value).to.equal(newValue)
            }).timeout(200000)
        }
    )

    context(
        'Sign as fee payerthe Partial Fee Delegation transaction via caver.contract (TxTypeFeeDelegatedSmartContractDeployWithRatio/TxTypeFeeDelegatedSmartContractExecutionWithRatio)',
        () => {
            it(`CAVERJS-UNIT-ETC-348: contract.deploy({ data }).signAsFeePayer({ from, feeDelegation: true, feeRatio, ... }) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                const signed = await contract.deploy({ data: byteCodeWithoutConstructor }).signAsFeePayer({
                    from: sender.address,
                    feePayer: feePayer.address,
                    feeDelegation: true,
                    feeRatio: 30,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-349: contract.deploy({ data, arguments }).signAsFeePayer({ from, feeDelegation: true, feeRatio, ... }) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithConstructor)

                const signed = await contract
                    .deploy({
                        data: byteCodeWithConstructor,
                        arguments: [keyString, valueString],
                    })
                    .signAsFeePayer({
                        from: sender.address,
                        feePayer: feePayer.address,
                        feeDelegation: true,
                        feeRatio: 30,
                        gas: 1000000,
                    })

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.feePayer).to.equal(feePayer.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-350: contract.methods['constructor'](byteCode).signAsFeePayer({ from, feeDelegation: true, feeRatio, ... }) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                // contract.methods['constructor'] formatted to contract.methods.constructor by linter
                // So eslint disable comment have to be added to block formatting
                // eslint-disable-next-line dot-notation
                const signed = await contract.methods['constructor'](byteCodeWithoutConstructor).signAsFeePayer({
                    from: sender.address,
                    feePayer: feePayer.address,
                    feeDelegation: true,
                    feeRatio: 30,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-351: contract.methods['constructor'](byteCode, arguments).signAsFeePayer({ from, feeDelegation: true, feeRatio, ... }) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithConstructor)

                // contract.methods['constructor'] formatted to contract.methods.constructor by linter
                // So eslint disable comment have to be added to block formatting
                // eslint-disable-next-line dot-notation
                const signed = await contract.methods['constructor'](byteCodeWithConstructor, 'keykey', 'valuevalue').signAsFeePayer({
                    from: sender.address,
                    feePayer: feePayer.address,
                    feeDelegation: true,
                    feeRatio: 30,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-352: contract.methods.constructor(byteCode).signAsFeePayer({ from, feeDelegation: true, feeRatio, ... }) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                const signed = await contract.methods.constructor(byteCodeWithoutConstructor).signAsFeePayer({
                    from: sender.address,
                    feePayer: feePayer.address,
                    feeDelegation: true,
                    feeRatio: 30,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-353: contract.methods.constructor(byteCode, arguments).signAsFeePayer({ from, feeDelegation: true, feeRatio, ... }) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithConstructor)

                const signed = await contract.methods.constructor(byteCodeWithConstructor, 'k', 'v').signAsFeePayer({
                    from: sender.address,
                    feePayer: feePayer.address,
                    feeDelegation: true,
                    feeRatio: 30,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-354: contract.signAsFeePayer({ from, feeDelegation: true, feeRatio, ... }, 'constructor', byteCode) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithoutConstructor)

                const signed = await contract.signAsFeePayer(
                    {
                        from: sender.address,
                        feePayer: feePayer.address,
                        feeDelegation: true,
                        feeRatio: 30,
                        gas: 1000000,
                    },
                    'constructor',
                    byteCodeWithoutConstructor
                )

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-355: contract.signAsFeePayer({ from, feeDelegation: true, feeRatio, ... }, 'constructor', byteCode, arguments) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithConstructor)

                const signed = await contract.signAsFeePayer(
                    {
                        from: sender.address,
                        feePayer: feePayer.address,
                        feeDelegation: true,
                        feeRatio: 30,
                        gas: 1000000,
                    },
                    'constructor',
                    byteCodeWithConstructor,
                    'keyForSign',
                    'valueForSign'
                )

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(caver.utils.isAddress(receipt.contractAddress)).to.be.true
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-356: contract.methods.set(arguments).signAsFeePayer({ from, feeDelegation: true, feeRatio, ... }) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithConstructor, contractAddress)

                const newKey = 'contract'
                const newValue = 'testing'
                const signed = await contract.methods.set(newKey, newValue).signAsFeePayer({
                    from: sender.address,
                    feePayer: feePayer.address,
                    feeDelegation: true,
                    feeRatio: 30,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.to.toLowerCase()).to.equal(contractAddress.toLowerCase())
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)

                const value = await contract.methods.get(newKey).call({ from: sender.address })
                expect(value).to.equal(newValue)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-357: contract.methods['set'](arguments).signAsFeePayer({ from, feeDelegation: true, feeRatio, ... }) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithConstructor, contractAddress)

                const newKey = 'how are you'
                const newValue = 'im fine'

                // contract.methods['set'] formatted to contract.methods.set by linter
                // So eslint disable comment have to be added to block formatting
                // eslint-disable-next-line dot-notation
                const signed = await contract.methods['set'](newKey, newValue).signAsFeePayer({
                    from: sender.address,
                    feePayer: feePayer.address,
                    feeDelegation: true,
                    feeRatio: 30,
                    gas: 1000000,
                })

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.to.toLowerCase()).to.equal(contractAddress.toLowerCase())
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)

                const value = await contract.methods.get(newKey).call({ from: sender.address })
                expect(value).to.equal(newValue)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-358: contract.signAsFeePayer({ from, feeDelegation: true, feeRatio, ... }, functionName, arguments) will create a transaction and sign the transaction as a fee payer`, async () => {
                const contract = new caver.contract(abiWithoutConstructor, contractAddress)

                const newKey = 'contract sign func'
                const newValue = 'should return signed tx'

                const signed = await contract.signAsFeePayer(
                    {
                        from: sender.address,
                        feePayer: feePayer.address,
                        feeDelegation: true,
                        feeRatio: 30,
                        gas: 1000000,
                    },
                    'set',
                    newKey,
                    newValue
                )

                expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
                expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)

                await caver.wallet.sign(sender.address, signed)
                const receipt = await caver.rpc.klay.sendRawTransaction(signed)

                expect(receipt.from).to.equal(sender.address)
                expect(receipt.to.toLowerCase()).to.equal(contractAddress.toLowerCase())
                expect(receipt.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)

                const value = await contract.methods.get(newKey).call({ from: sender.address })
                expect(value).to.equal(newValue)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-365: contract.signAsFeePayer({ from, feeRatio, ... }, functionName, arguments) will throw error when feeDelegation is undefined`, async () => {
                const contract = new caver.contract(abiWithoutConstructor, '0x1da61ed1c876206ff1aafdeb39717da7f078040b')

                const newKey = 'contract sign func'
                const newValue = 'should return signed tx'

                const expectedError = `feeDelegation field should be defined as 'true' to sign as a fee payer`
                await expect(
                    contract.signAsFeePayer(
                        {
                            from: sender.address,
                            feePayer: feePayer.address,
                            feeRatio: 30,
                            gas: 1000000,
                        },
                        'set',
                        newKey,
                        newValue
                    )
                ).to.be.rejectedWith(expectedError)
            }).timeout(200000)

            it(`CAVERJS-UNIT-ETC-366: contract.signAsFeePayer({ from, feeRatio, ... }, functionName, arguments) will throw error when feeDelegation is false`, async () => {
                const contract = new caver.contract(abiWithoutConstructor, '0x1da61ed1c876206ff1aafdeb39717da7f078040b')

                const newKey = 'contract sign func'
                const newValue = 'should return signed tx'

                const expectedError = `feeDelegation field should be defined as 'true' to sign as a fee payer`
                await expect(
                    contract.signAsFeePayer(
                        {
                            from: sender.address,
                            feePayer: feePayer.address,
                            feeDelegation: false,
                            feeRatio: 30,
                            gas: 1000000,
                        },
                        'set',
                        newKey,
                        newValue
                    )
                ).to.be.rejectedWith(expectedError)
            }).timeout(200000)
        }
    )

    context('Set values via contract.options', () => {
        it(`CAVERJS-UNIT-ETC-359: Set feeDelegation in options to deploy contract`, async () => {
            const contract = new caver.contract(abiWithoutConstructor)
            contract.options.feeDelegation = true

            let sendOptions = {
                from: sender.address,
                feePayer: feePayer.address,
                gas: 1000000,
                contractDeployFormatter,
            }
            let deployed = await contract.deploy({ data: byteCodeWithoutConstructor }).send(sendOptions)

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.feePayer).to.equal(feePayer.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            deployed = await contract.methods.constructor(byteCodeWithoutConstructor).send(sendOptions)

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.feePayer).to.equal(feePayer.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            deployed = await contract.methods.constructor(byteCodeWithoutConstructor).send(sendOptions)

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.feePayer).to.equal(feePayer.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            deployed = await contract.deploy(sendOptions, byteCodeWithoutConstructor)

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.feePayer).to.equal(feePayer.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            sendOptions = {
                from: sender.address,
                gas: 1000000,
            }
            let signed = await contract.deploy({ data: byteCodeWithoutConstructor }).sign(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            signed = await contract.methods.constructor(byteCodeWithoutConstructor).sign(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            signed = await contract.methods.constructor(byteCodeWithoutConstructor).sign(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            signed = await contract.sign(sendOptions, 'constructor', byteCodeWithoutConstructor)

            expect(signed.from).to.equal(sender.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            sendOptions.feePayer = feePayer.address
            signed = await contract.deploy({ data: byteCodeWithoutConstructor }).signAsFeePayer(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            signed = await contract.methods.constructor(byteCodeWithoutConstructor).signAsFeePayer(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            signed = await contract.methods.constructor(byteCodeWithoutConstructor).signAsFeePayer(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            signed = await contract.signAsFeePayer(sendOptions, 'constructor', byteCodeWithoutConstructor)

            expect(signed.from).to.equal(sender.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-360: Set feeDelegation in options when execute contract`, async () => {
            const contract = new caver.contract(abiWithoutConstructor, contractAddress)
            contract.options.feeDelegation = true

            let sendOptions = {
                from: sender.address,
                feePayer: feePayer.address,
                gas: 1000000,
            }
            let result = await contract.methods.set('k', 'v').send(sendOptions)

            expect(result.from).to.equal(sender.address)
            expect(result.feePayer).to.equal(feePayer.address)
            expect(result.status).to.be.true
            expect(result.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            result = await contract.methods.set('k', 'v').send(sendOptions)

            expect(result.from).to.equal(sender.address)
            expect(result.feePayer).to.equal(feePayer.address)
            expect(result.status).to.be.true
            expect(result.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            result = await contract.methods.set('k', 'v').send(sendOptions)

            expect(result.from).to.equal(sender.address)
            expect(result.feePayer).to.equal(feePayer.address)
            expect(result.status).to.be.true
            expect(result.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            result = await contract.send(sendOptions, 'set', 'k', 'v')

            expect(result.from).to.equal(sender.address)
            expect(result.feePayer).to.equal(feePayer.address)
            expect(result.status).to.be.true
            expect(result.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            sendOptions = {
                from: sender.address,
                gas: 1000000,
            }
            let signed = await contract.methods.set('k', 'v').sign(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            signed = await contract.methods.set('k', 'v').sign(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            signed = await contract.sign(sendOptions, 'set', 'k', 'v')

            expect(signed.from).to.equal(sender.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            sendOptions.feePayer = feePayer.address
            signed = await contract.methods.set('k', 'v').signAsFeePayer(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            signed = await contract.methods.set('k', 'v').signAsFeePayer(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            signed = await contract.signAsFeePayer(sendOptions, 'set', 'k', 'v')

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-361: Set feePayer in options to deploy contract`, async () => {
            const contract = new caver.contract(abiWithoutConstructor)
            contract.options.feePayer = feePayer.address

            let sendOptions = {
                from: sender.address,
                feeDelegation: true,
                gas: 1000000,
                contractDeployFormatter,
            }
            let deployed = await contract.deploy({ data: byteCodeWithoutConstructor }).send(sendOptions)

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.feePayer).to.equal(feePayer.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            deployed = await contract.methods.constructor(byteCodeWithoutConstructor).send(sendOptions)

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.feePayer).to.equal(feePayer.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            deployed = await contract.methods.constructor(byteCodeWithoutConstructor).send(sendOptions)

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.feePayer).to.equal(feePayer.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            deployed = await contract.deploy(sendOptions, byteCodeWithoutConstructor)

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.feePayer).to.equal(feePayer.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            sendOptions = {
                from: sender.address,
                feeDelegation: true,
                gas: 1000000,
            }
            let signed = await contract.deploy({ data: byteCodeWithoutConstructor }).sign(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            signed = await contract.methods.constructor(byteCodeWithoutConstructor).sign(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            signed = await contract.methods.constructor(byteCodeWithoutConstructor).sign(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            signed = await contract.sign(sendOptions, 'constructor', byteCodeWithoutConstructor)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            signed = await contract.deploy({ data: byteCodeWithoutConstructor }).signAsFeePayer(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            signed = await contract.methods.constructor(byteCodeWithoutConstructor).signAsFeePayer(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            signed = await contract.methods.constructor(byteCodeWithoutConstructor).signAsFeePayer(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            signed = await contract.signAsFeePayer(sendOptions, 'constructor', byteCodeWithoutConstructor)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-362: Set feePayer in options when execute contract`, async () => {
            const contract = new caver.contract(abiWithoutConstructor, contractAddress)
            contract.options.feePayer = feePayer.address

            let sendOptions = {
                from: sender.address,
                feeDelegation: true,
                gas: 1000000,
            }
            let result = await contract.methods.set('k', 'v').send(sendOptions)

            expect(result.from).to.equal(sender.address)
            expect(result.feePayer).to.equal(feePayer.address)
            expect(result.status).to.be.true
            expect(result.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            result = await contract.methods.set('k', 'v').send(sendOptions)

            expect(result.from).to.equal(sender.address)
            expect(result.feePayer).to.equal(feePayer.address)
            expect(result.status).to.be.true
            expect(result.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            result = await contract.methods.set('k', 'v').send(sendOptions)

            expect(result.from).to.equal(sender.address)
            expect(result.feePayer).to.equal(feePayer.address)
            expect(result.status).to.be.true
            expect(result.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            result = await contract.send(sendOptions, 'set', 'k', 'v')

            expect(result.from).to.equal(sender.address)
            expect(result.feePayer).to.equal(feePayer.address)
            expect(result.status).to.be.true
            expect(result.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            sendOptions = {
                from: sender.address,
                feeDelegation: true,
                gas: 1000000,
            }
            let signed = await contract.methods.set('k', 'v').sign(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            signed = await contract.methods.set('k', 'v').sign(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            signed = await contract.sign(sendOptions, 'set', 'k', 'v')

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            signed = await contract.methods.set('k', 'v').signAsFeePayer(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            signed = await contract.methods.set('k', 'v').signAsFeePayer(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            signed = await contract.signAsFeePayer(sendOptions, 'set', 'k', 'v')

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-363: Set feeRatio in options to deploy contract`, async () => {
            const contract = new caver.contract(abiWithoutConstructor)
            contract.options.feeRatio = 30

            let sendOptions = {
                from: sender.address,
                feeDelegation: true,
                feePayer: feePayer.address,
                gas: 1000000,
                contractDeployFormatter,
            }
            let deployed = await contract.deploy({ data: byteCodeWithoutConstructor }).send(sendOptions)

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.feePayer).to.equal(feePayer.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            expect(deployed.feeRatio).to.equal(contract.options.feeRatio)

            deployed = await contract.methods.constructor(byteCodeWithoutConstructor).send(sendOptions)

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.feePayer).to.equal(feePayer.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            expect(deployed.feeRatio).to.equal(contract.options.feeRatio)

            deployed = await contract.methods.constructor(byteCodeWithoutConstructor).send(sendOptions)

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.feePayer).to.equal(feePayer.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            expect(deployed.feeRatio).to.equal(contract.options.feeRatio)

            deployed = await contract.deploy(sendOptions, byteCodeWithoutConstructor)

            expect(deployed.from).to.equal(sender.address)
            expect(deployed.feePayer).to.equal(feePayer.address)
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            expect(deployed.feeRatio).to.equal(contract.options.feeRatio)

            sendOptions = {
                from: sender.address,
                feeDelegation: true,
                gas: 1000000,
            }
            let signed = await contract.deploy({ data: byteCodeWithoutConstructor }).sign(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            expect(signed.feeRatio).to.equal(contract.options.feeRatio)

            signed = await contract.methods.constructor(byteCodeWithoutConstructor).sign(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            expect(signed.feeRatio).to.equal(contract.options.feeRatio)

            signed = await contract.methods.constructor(byteCodeWithoutConstructor).sign(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            expect(signed.feeRatio).to.equal(contract.options.feeRatio)

            signed = await contract.sign(sendOptions, 'constructor', byteCodeWithoutConstructor)

            expect(signed.from).to.equal(sender.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            expect(signed.feeRatio).to.equal(contract.options.feeRatio)

            sendOptions.feePayer = feePayer.address
            signed = await contract.deploy({ data: byteCodeWithoutConstructor }).signAsFeePayer(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            expect(signed.feeRatio).to.equal(contract.options.feeRatio)

            signed = await contract.methods.constructor(byteCodeWithoutConstructor).signAsFeePayer(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            expect(signed.feeRatio).to.equal(contract.options.feeRatio)

            signed = await contract.methods.constructor(byteCodeWithoutConstructor).signAsFeePayer(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            expect(signed.feeRatio).to.equal(contract.options.feeRatio)

            signed = await contract.signAsFeePayer(sendOptions, 'constructor', byteCodeWithoutConstructor)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
            expect(signed.feeRatio).to.equal(contract.options.feeRatio)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-364: Set feeRatio in options when execute contract`, async () => {
            const contract = new caver.contract(abiWithoutConstructor, contractAddress)
            contract.options.feeRatio = 30

            let sendOptions = {
                from: sender.address,
                feePayer: feePayer.address,
                feeDelegation: true,
                gas: 1000000,
            }
            let result = await contract.methods.set('k', 'v').send(sendOptions)

            expect(result.from).to.equal(sender.address)
            expect(result.feePayer).to.equal(feePayer.address)
            expect(result.status).to.be.true
            expect(result.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)
            expect(result.feeRatio).to.equal(contract.options.feeRatio)

            result = await contract.methods.set('k', 'v').send(sendOptions)

            expect(result.from).to.equal(sender.address)
            expect(result.feePayer).to.equal(feePayer.address)
            expect(result.status).to.be.true
            expect(result.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)
            expect(result.feeRatio).to.equal(contract.options.feeRatio)

            result = await contract.methods.set('k', 'v').send(sendOptions)

            expect(result.from).to.equal(sender.address)
            expect(result.feePayer).to.equal(feePayer.address)
            expect(result.status).to.be.true
            expect(result.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)
            expect(result.feeRatio).to.equal(contract.options.feeRatio)

            result = await contract.send(sendOptions, 'set', 'k', 'v')

            expect(result.from).to.equal(sender.address)
            expect(result.feePayer).to.equal(feePayer.address)
            expect(result.status).to.be.true
            expect(result.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)
            expect(result.feeRatio).to.equal(contract.options.feeRatio)

            sendOptions = {
                from: sender.address,
                feeDelegation: true,
                gas: 1000000,
            }
            let signed = await contract.methods.set('k', 'v').sign(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)
            expect(signed.feeRatio).to.equal(contract.options.feeRatio)

            signed = await contract.methods.set('k', 'v').sign(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)
            expect(signed.feeRatio).to.equal(contract.options.feeRatio)

            signed = await contract.sign(sendOptions, 'set', 'k', 'v')

            expect(signed.from).to.equal(sender.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)
            expect(signed.feeRatio).to.equal(contract.options.feeRatio)

            sendOptions.feePayer = feePayer.address
            signed = await contract.methods.set('k', 'v').signAsFeePayer(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)
            expect(signed.feeRatio).to.equal(contract.options.feeRatio)

            signed = await contract.methods.set('k', 'v').signAsFeePayer(sendOptions)

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)
            expect(signed.feeRatio).to.equal(contract.options.feeRatio)

            signed = await contract.signAsFeePayer(sendOptions, 'set', 'k', 'v')

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)
            expect(signed.feeRatio).to.equal(contract.options.feeRatio)
        }).timeout(200000)
    })

    context('Send to the Klaytn if a keyring cannnot be found in caver.wallet', () => {
        it(`CAVERJS-UNIT-ETC-389: should throw an error if Node also does not have that account when send basic`, async () => {
            const contract = new caver.contract(abiWithoutConstructor, contractAddress)

            const sendOptions = {
                from: caver.wallet.keyring.generate().address,
                gas: 1000000,
            }

            const expectedError = `Returned error: unknown account`
            await expect(contract.send(sendOptions, 'set', 'k', 'v')).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-390: should throw an error if Node also does not have that account when send fd`, async () => {
            const contract = new caver.contract(abiWithoutConstructor, contractAddress)

            const sendOptions = {
                from: caver.wallet.keyring.generate().address,
                gas: 1000000,
                feeDelegation: true,
                feePayer: caver.wallet.keyring.generate().address,
            }

            const expectedError = `Returned error: unknown account`
            await expect(contract.send(sendOptions, 'set', 'k', 'v')).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-391: should throw an error if Node also does not have that account when sign`, async () => {
            const contract = new caver.contract(abiWithoutConstructor, contractAddress)

            const sendOptions = {
                from: caver.wallet.keyring.generate().address,
                gas: 1000000,
            }

            const expectedError = `Returned error: unknown account`
            await expect(contract.sign(sendOptions, 'set', 'k', 'v')).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-392: should throw an error if Node also does not have that account when signAsFeePayer`, async () => {
            const contract = new caver.contract(abiWithoutConstructor, contractAddress)

            const sendOptions = {
                from: caver.wallet.keyring.generate().address,
                gas: 1000000,
                feeDelegation: true,
                feePayer: caver.wallet.keyring.generate().address,
            }

            const expectedError = `Returned error: unknown account`
            await expect(contract.signAsFeePayer(sendOptions, 'set', 'k', 'v')).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-393: should send to the Klaytn if in-memory wallet does not have a from account`, async () => {
            try {
                await caver.klay.personal.importRawKey(sender.key.privateKey, password)
            } catch (e) {}
            await caver.klay.personal.unlockAccount(sender.address, password)

            const contract = new caver.contract(abiWithoutConstructor, contractAddress)

            // To send to the Klaytn, should remove in the in-memory wallet
            caver.wallet.remove(sender.address)

            // Basic Transaction - `from` is not existed in the `caver.wallet`
            const sendOptionsForBasic = {
                from: sender.address,
                gas: 1000000,
            }

            const resultBasic = await contract.send(sendOptionsForBasic, 'set', 'k', 'v')

            expect(resultBasic.from).to.equal(sender.address)
            expect(resultBasic.status).to.be.true
            expect(resultBasic.type).to.equal(TX_TYPE_STRING.TxTypeSmartContractExecution)

            // FD/FDR Transaction - `from` is not existed in the `caver.wallet` / `feePayer` is existed in the `caver.wallet`
            const sendOptionsForFD = {
                from: sender.address,
                gas: 1000000,
                feeDelegation: true,
                feePayer: feePayer.address,
            }

            const resultFD = await contract.send(sendOptionsForFD, 'set', 'k', 'v')

            expect(resultFD.from).to.equal(sender.address)
            expect(resultFD.feePayer).to.equal(feePayer.address)
            expect(resultFD.status).to.be.true
            expect(resultFD.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            // FD/FDR Transaction - `from` is not existed in the `caver.wallet` / `feePayer` is not existed in the `caver.wallet`
            try {
                await caver.klay.personal.importRawKey(feePayer.key.privateKey, password)
            } catch (e) {}
            await caver.klay.personal.unlockAccount(feePayer.address, password)

            caver.wallet.remove(feePayer.address)
            const sendOptionsForFDWithNodeAccount = {
                from: sender.address,
                gas: 1000000,
                feeDelegation: true,
                feePayer: feePayer.address,
            }

            const resultForFDWithNodeAccount = await contract.send(sendOptionsForFDWithNodeAccount, 'set', 'k', 'v')

            expect(resultForFDWithNodeAccount.from).to.equal(sender.address)
            expect(resultForFDWithNodeAccount.feePayer).to.equal(feePayer.address)
            expect(resultForFDWithNodeAccount.status).to.be.true
            expect(resultForFDWithNodeAccount.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)
        }).timeout(200000)

        it(`CAVERJS-UNIT-ETC-394: should send to the Klaytn if in-memory wallet does not have a feePayer account`, async () => {
            const contract = new caver.contract(abiWithoutConstructor, contractAddress)

            // To send to the Klaytn, should remove in the in-memory wallet
            caver.wallet.add(sender)

            // FD/FDR Transaction - `feePayer` is not existed in the `caver.wallet`. And `from` is existed in the `caver.wallet`.
            const sendOptionsForFD = {
                from: sender.address,
                gas: 1000000,
                feeDelegation: true,
                feePayer: feePayer.address,
            }

            const resultFD = await contract.send(sendOptionsForFD, 'set', 'k', 'v')

            expect(resultFD.from).to.equal(sender.address)
            expect(resultFD.feePayer).to.equal(feePayer.address)
            expect(resultFD.status).to.be.true
            expect(resultFD.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)
        }).timeout(200000)
    })
})
