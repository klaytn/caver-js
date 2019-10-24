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

const { expect } = require('chai')
const fetch = require('node-fetch')
const Caver = require('../index.js')

describe('caver middleware', () => {
    it('when sendTransaction, does it logs?', async () => {
        const caver = new Caver('http://aspen.klaytn.com')

        caver.use(caver.middleware.builtin.rpcFilter(['klay_gasPrice'], 'exclude'))

        caver.use(caver.middleware.builtin.timeMeasure())

        caver.use(
            caver.middleware.builtin.fileLogger({
                path: './logs',
                name: 'rpcLogger',
            })
        )

        // 1. Create sender address
        caver.klay.accounts.wallet.add(caver.klay.accounts.create())
        // 2. Create receiver address
        caver.klay.accounts.wallet.add(caver.klay.accounts.create())

        caver.klay.getBlockNumber()
        caver.klay.getBlockNumber()

        const res = await fetch(`https://apiwallet.klaytn.com/faucet/?address=${caver.klay.accounts.wallet[0].address}`)
        caver.klay
            .sendTransaction({
                from: caver.klay.accounts.wallet[0].address,
                to: caver.klay.accounts.wallet[1].address,
                value: caver.utils.toPeb('1', 'KLAY'),
                chainId: '1000',
                gas: '50000',
            })
            .once('receipt', async receipt => {})
        caver.klay.getBlockNumber()
        caver.klay.getBlockNumber()
        caver.klay.getBlockNumber()
    }).timeout(100000)
})
