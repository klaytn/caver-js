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

const testRPCURL = require('./testrpc')

const Caver = require('../index.js')

let caver

beforeEach(() => {
    caver = new Caver(testRPCURL)
})

describe('KlaytnWalletKey.', () => {
    // Using private key for testing with getKlaytnWalletKey
    it('CAVERJS-UNIT-WALLET-064 : getKlaytnWalletKey using wallet with private key. Access wallet by address', () => {
        const testPrivateKey = '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04'
        const acct = caver.klay.accounts.wallet.add(testPrivateKey)
        expect(acct.privateKey).equal('0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04')
        expect(acct.address).equal('0xee135d0b57c7ff81b198763cfd7c43f03a5f7622')

        const ret = caver.klay.accounts.wallet.getKlaytnWalletKey(acct.address)
        expect(ret).equal(
            '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
        )
    })

    it('CAVERJS-UNIT-WALLET-065 : getKlaytnWalletKey using wallet with private key. Access wallet by index', () => {
        const testPrivateKey = '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04'
        const acct = caver.klay.accounts.wallet.add(testPrivateKey)
        expect(acct.privateKey).equal('0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04')
        expect(acct.address).equal('0xee135d0b57c7ff81b198763cfd7c43f03a5f7622')

        const ret = caver.klay.accounts.wallet.getKlaytnWalletKey(acct.index)
        expect(ret).equal(
            '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
        )
    })

    it('CAVERJS-UNIT-WALLET-066 : getKlaytnWalletKey using account with private key.', () => {
        const testPrivateKey = '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04'
        const acct = caver.klay.accounts.wallet.add(testPrivateKey)
        expect(acct.privateKey).equal('0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04')
        expect(acct.address).equal('0xee135d0b57c7ff81b198763cfd7c43f03a5f7622')

        const ret = acct.getKlaytnWalletKey()
        expect(ret).equal(
            '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
        )
    })

    // Using KlaytnWalletKey for testing with getKlaytnWalletKey
    it('CAVERJS-UNIT-WALLET-071 : getKlaytnWalletKey using wallet with KlaytnWalletKey. Access wallet by address', () => {
        const testPrivateKey =
            '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
        const acct = caver.klay.accounts.wallet.add(testPrivateKey)
        expect(acct.privateKey).equal('0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04')
        expect(acct.address).equal('0xee135d0b57c7ff81b198763cfd7c43f03a5f7622')

        const ret = caver.klay.accounts.wallet.getKlaytnWalletKey(acct.address)
        expect(ret).equal(
            '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
        )
    })

    it('CAVERJS-UNIT-WALLET-072 : getKlaytnWalletKey using wallet with KlaytnWalletKey. Access wallet by index', () => {
        const testPrivateKey =
            '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
        const acct = caver.klay.accounts.wallet.add(testPrivateKey)
        expect(acct.privateKey).equal('0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04')
        expect(acct.address).equal('0xee135d0b57c7ff81b198763cfd7c43f03a5f7622')

        const ret = caver.klay.accounts.wallet.getKlaytnWalletKey(acct.index)
        expect(ret).equal(
            '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
        )
    })

    it('CAVERJS-UNIT-WALLET-073 : getKlaytnWalletKey using account with KlaytnWalletKey.', () => {
        const testPrivateKey =
            '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
        const acct = caver.klay.accounts.wallet.add(testPrivateKey)
        expect(acct.privateKey).equal('0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04')
        expect(acct.address).equal('0xee135d0b57c7ff81b198763cfd7c43f03a5f7622')

        const ret = acct.getKlaytnWalletKey()
        expect(ret).equal(
            '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
        )
    })
})
