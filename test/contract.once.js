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

const { expect } = require('./extendedChai')

const websocketURL = require('./testWebsocket')

const Caver = require('../index.js')

const caver = new Caver(websocketURL)

let senderPrvKey
let senderAddress

before(() => {
    senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey

    caver.klay.accounts.wallet.add(senderPrvKey)

    const sender = caver.klay.accounts.privateKeyToAccount(senderPrvKey)
    senderAddress = sender.address
})

describe('caver.klay.contract.once', () => {
    it('CAVERJS-UNIT-ETC-002 : when event fires, data should be retrived through contract.once', async () => {
        const byteCode =
            '0x6080604052348015600f57600080fd5b5060e98061001e6000396000f300608060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063954ab4b2146044575b600080fd5b348015604f57600080fd5b5060566058565b005b7f90a042becc42ba1b13a5d545701bf5ceff20b24d9e5cc63b67f96ef814d80f0933604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a15600a165627a7a723058200ebb53e9d575350ceb2d92263b7d4920888706b5221f024e7bbc10e3dbb8e18d0029'
        const helloContractABI = [
            {
                constant: false,
                inputs: [],
                name: 'say',
                outputs: [],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        name: 'who',
                        type: 'address',
                    },
                ],
                name: 'callevent',
                type: 'event',
            },
        ]

        const contractInst = new caver.klay.Contract(helloContractABI)
        const newInstance = await contractInst.deploy({ data: byteCode }).send({
            from: senderAddress,
            gas: 100000000,
            value: 0,
        })
        let dataVariable
        newInstance.once('callevent', (error, data) => {
            expect(error).to.be.null
            dataVariable = data
        })

        const options = {
            from: senderAddress,
            gas: 30000,
        }

        await newInstance.methods.say().send(options)

        expect(dataVariable).not.to.null
        caver.currentProvider.connection.close()
    }).timeout(200000)
})
