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

const Caver = require('../index')
const testRPCURL = require('./testrpc')

const caver = new Caver(testRPCURL)

describe('caver.klay.accounts.signTransaction', () => {
    it('CAVERJS-UNIT-TX-001 : should be rejected when data field is missing for contract creation tx', () => {
        const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())

        const tx = {
            value: '1000000000',
            gas: 2000000,
        }

        expect(caver.klay.accounts.signTransaction(tx, testAccount.transactionKey)).to.eventually.rejected
    })
})
