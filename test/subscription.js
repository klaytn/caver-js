/*
    Copyright 2019 The caver-js Authors
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

const { expect } = require('chai')
const websocketURL = require('./testWebsocket')

const Caver = require('../index')

const caver = new Caver(websocketURL)

let senderPrvKey
let senderAddress
let receiver
let contractAddress
let contractAbi

// If you are using websocket provider, subscribe the 'newBlockHeaders' event through the subscriptions object after sending the transaction.
// When receiving the 'newBlockHeaders' event, it queries the transaction receipt.
// You can think 'Subscription' object that inherit 'EventEmitter' work well, meaning that receipt comes out as a result after you submit the transaction.
// Here we test the process of sending the transaction and receiving the receipt as the result value to ensure that the 'Subscription' inheriting 'EventEmitter' is working properly.

// Flow
//    [request] klay_sendRawTransaction
// -> [response] transactionHash
// -> [request] klay_getTransactionReceipt
// -> [response] null
// -> Add 'newBlockHeaders' event subscription
// -> [event] new block header event
// -> [request] klay_getTransactionReceipt
// -> [response] receipt

async function prepareContractTesting() {
    const kip7 = await caver.kct.kip7.deploy(
        {
            name: 'Jamie',
            symbol: 'JME',
            decimals: 18,
            initialSupply: '1000000000000',
        },
        senderAddress
    )
    contractAddress = kip7.options.address
    contractAbi = kip7.options.jsonInterface

    return kip7.transfer(receiver.address, 1000, { from: senderAddress })
}

describe('subscription should work well with websocket connection', () => {
    before(function(done) {
        this.timeout(200000)

        senderPrvKey =
            process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
                ? `0x${process.env.privateKey}`
                : process.env.privateKey

        senderAddress = caver.klay.accounts.wallet.add(senderPrvKey).address
        caver.wallet.add(caver.wallet.keyring.createFromPrivateKey(senderPrvKey))

        receiver = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
        caver.wallet.add(caver.wallet.keyring.createFromPrivateKey(receiver.privateKey))

        prepareContractTesting().then(() => done())
    })

    it('CAVERJS-UNIT-ETC-094: sendTransaction should return a transaction receipt.', async () => {
        const txObj = {
            from: senderAddress,
            to: receiver.address,
            value: 1,
            gas: 900000,
        }
        const receipt = await caver.klay.sendTransaction(txObj)

        expect(receipt).not.to.null
        expect(receipt.blockHash).not.to.undefined
        expect(receipt.blockNumber).not.to.undefined
        expect(receipt.contractAddress).not.to.undefined
        expect(receipt.from).not.to.undefined
        expect(receipt.gas).not.to.undefined
        expect(receipt.gasPrice).not.to.undefined
        expect(receipt.gasUsed).not.to.undefined
        expect(receipt.logs).not.to.undefined
        expect(receipt.logsBloom).not.to.undefined
        expect(receipt.nonce).not.to.undefined
        expect(receipt.signatures).not.to.undefined
        expect(receipt.status).equals(true)
        expect(receipt.to).not.to.undefined
        expect(receipt.transactionHash).not.to.undefined
        expect(receipt.transactionIndex).not.to.undefined
        expect(receipt.type).not.to.undefined
        expect(receipt.typeInt).not.to.undefined
        expect(receipt.value).not.to.undefined
    }).timeout(10000)

    it('CAVERJS-UNIT-ETC-262: should emit subscription id when subscription is created', done => {
        caver.kct.kip17.deploy({ name: 'Jasmine', symbol: 'JAS' }, senderAddress).then(deployed => {
            deployed.events.MinterAdded({}).on('connected', subscriptionId => {
                expect(subscriptionId).not.to.be.undefined
                done()
            })
        })
    }).timeout(30000)

    it('CAVERJS-UNIT-ETC-410: contract.subscribe should subscribe the event of the contract with caver.klay.Contract', async () => {
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

        const contractInst = caver.contract.create(helloContractABI)
        const deployed = await contractInst.deploy({ data: byteCode }).send({
            from: senderAddress,
            gas: 100000000,
            value: 0,
        })

        let dataVariable
        let eventCount = 0
        let subscription = deployed.subscribe('callevent', (error, data) => {
            expect(error).to.be.null
            dataVariable = data
            eventCount++
        })

        const options = {
            from: senderAddress,
            gas: 30000,
        }

        await deployed.methods.say().send(options)
        await deployed.methods.say().send(options)

        while (eventCount < 2) {}
        subscription.unsubscribe()

        expect(dataVariable).not.to.null

        const commonContract = caver.contract.create(helloContractABI, deployed.options.address)

        dataVariable = null
        eventCount = 0
        subscription = commonContract.subscribe('callevent', (error, data) => {
            expect(error).to.be.null
            dataVariable = data
            eventCount++
        })

        await commonContract.methods.say().send(options)
        await commonContract.methods.say().send(options)

        while (eventCount < 2) {}
        subscription.unsubscribe()

        expect(dataVariable).not.to.null
    }).timeout(200000)

    // Regression test for a race-condition where a fresh caver instance
    // subscribing to past events would have its call parameters deleted while it
    // made initial Websocket handshake and return an incorrect response.
    it('CAVERJS-UNIT-ETC-398: should immediately listen for events in the past', async () => {
        const freshCaver = new Caver(websocketURL)
        const contract = freshCaver.contract.create(contractAbi, contractAddress)

        let counter = 0
        const latestBlock = await caver.rpc.klay.getBlockNumber()
        caver.currentProvider.connection.close()

        await new Promise(resolve => {
            contract.events
                .allEvents({
                    fromBlock: 0,
                })
                .on('data', function(event) {
                    counter++
                    expect(event.blockNumber < latestBlock).to.be.true

                    if (counter === 2) {
                        this.removeAllListeners()
                        freshCaver.currentProvider.connection.close()
                        resolve()
                    }
                })
        })
    }).timeout(30000)
})
