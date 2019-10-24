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
const BN = require('bn.js')
const testRPCURL = require('./testrpc')

const Caver = require('../index.js')

const caver = new Caver(testRPCURL)

describe('accounts.privateKeyToAccount', done => {
    it('CAVERJS-UNIT-WALLET-088 : should return same address even `0x` is missing', async () => {
        const { address: address1 } = caver.klay.accounts.privateKeyToAccount(
            '0xd7a522fd98344f2f0a0515949ba610c6e9f8bf39266256d964078da9960527d5'
        )
        const { address: address2 } = caver.klay.accounts.privateKeyToAccount(
            'd7a522fd98344f2f0a0515949ba610c6e9f8bf39266256d964078da9960527d5'
        )

        expect(address1).to.equal(address2)
    })

    it('CAVERJS-UNIT-WALLET-089 : if `0x` prefix is used the length of privateKey should be 66', async () => {
        const wrongPrivateKey = caver.utils.randomHex(33) // 0x prefixed, 64 length.
        expect(() => caver.klay.accounts.privateKeyToAccount(wrongPrivateKey)).to.throw()
    })

    it('CAVERJS-UNIT-WALLET-090 : if send klaytnPrivateKey as a parameter, save account in caver-js with that information (not HRA)', async () => {
        const klaytnPrivateKey =
            '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
        const account = caver.klay.accounts.privateKeyToAccount(klaytnPrivateKey)
        expect(account.address).to.equal('0xee135d0b57c7ff81b198763cfd7c43f03a5f7622')
        expect(account.privateKey).to.equal('0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04')
    })

    it('CAVERJS-UNIT-WALLET-092 : if receive invalid klaytnPrivateKey return error', async () => {
        const invalidKlaytnPrivateKey =
            '600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xbe0f875e8e74c76364cd3cd9f73e7d034778547fe7'
        expect(() => caver.klay.accounts.privateKeyToAccount(invalidKlaytnPrivateKey)).to.throw(
            `Invalid private key(${invalidKlaytnPrivateKey})`
        )
    })
})
