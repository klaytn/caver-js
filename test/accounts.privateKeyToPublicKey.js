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

const testRPCURL = require('./testrpc')

const Caver = require('../index.js')

const caver = new Caver(testRPCURL)

describe('caver.klay.accounts.privateKeyToPublicKey', () => {
    it('CAVERJS-UNIT-WALLET-015 : Should return publicKey with valid argument', () => {
        const privateKey1 = '0xf5f83691fa6619396e1b8810b49cec1de624a07c7a7ef36cf860479282ff7610'
        const privateKey2 = 'f5f83691fa6619396e1b8810b49cec1de624a07c7a7ef36cf860479282ff7610'

        const pubKey =
            '0xb154904c7453522361fd19da5e830b47c8e5a4724ac94870a179c4da5b272b04b7e4c087e99dd50ce2c4fd6e1cb74b92f9b6a364e323d1d210851ad00de47281'
        expect(caver.klay.accounts.privateKeyToPublicKey(privateKey1)).to.equals(pubKey)
        expect(caver.klay.accounts.privateKeyToPublicKey(privateKey2)).to.equals(pubKey)
    })

    it('CAVERJS-UNIT-WALLET-016 : Should return publicKey with klaytnWalletKey format', () => {
        const privateKey =
            '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'

        const pubKey =
            '0x813b6bdfccfeab122aaae598b6650c6ccd0a6455858ce9f02f27abf335a7de91257fc8f169d19058e448c39caca57195eb767c0da43ae60c6be64dc51ab6e643'
        expect(caver.klay.accounts.privateKeyToPublicKey(privateKey)).to.equals(pubKey)
    })

    it('CAVERJS-UNIT-WALLET-017 : Should return error with invalid argument', () => {
        expect(() => caver.klay.accounts.privateKeyToPublicKey(caver.utils.randomHex(31))).to.throw()
        expect(() => caver.klay.accounts.privateKeyToPublicKey(caver.utils.randomHex(33))).to.throw()
    })

    it('CAVERJS-UNIT-WALLET-018 : Should return error with not hex argument', () => {
        expect(() =>
            caver.klay.accounts.privateKeyToPublicKey('0xf5f83691fa6619396e1b8810b49cec1de624a07c7a7ef36cf860479282ff7xyz')
        ).to.throw()
    })
})
