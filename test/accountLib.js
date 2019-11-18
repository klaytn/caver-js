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

describe('caver.klay.accounts.privateKeyToAccount', () => {
    it('CAVERJS-UNIT-WALLET-001 : should not thrown an error when given private key is valid.', () => {
        expect(() =>
            caver.klay.accounts.privateKeyToAccount('0xad04c330249e07b6cf6914386e653eb313bde2c6193cd11319e31ff5733f6c4f')
        ).not.to.throw()
    })

    it('CAVERJS-UNIT-WALLET-002 : should thrown an error when given private key is invalid.', () => {
        expect(() => caver.klay.accounts.privateKeyToAccount('aaaa')).to.throw()
    })

    it('CAVERJS-UNIT-WALLET-003 : should thrown an error when given private key length is not 32 bytes.', () => {
        expect(() => caver.klay.accounts.privateKeyToAccount(caver.utils.randomHex(31))).to.throw()
        expect(() => caver.klay.accounts.privateKeyToAccount(caver.utils.randomHex(33))).to.throw()
    })

    it('CAVERJS-UNIT-WALLET-004 : should not thrown an error when given private key is Klaytn wallet key format.', () => {
        const acct1 = caver.klay.accounts.privateKeyToAccount(
            '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
        )
        expect(acct1.privateKey).to.equals('0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04')
        expect(acct1.address).to.equals('0xee135d0b57c7ff81b198763cfd7c43f03a5f7622')
    })

    it('CAVERJS-UNIT-WALLET-095 : should thrown an error when given private key format is humanReadableAddress.', () => {
        expect(() =>
            caver.klay.accounts.privateKeyToAccount(
                '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x010x6a61736d696e652e6b6c6179746e000000000000'
            )
        ).to.throw('HumanReadableAddress is not supported yet.')
    })
})

describe('caver.klay.accounts.wallet.updatePrivateKey', () => {
    it('CAVERJS-UNIT-WALLET-005 : should update privateKey with non human readable wallet.', () => {
        const account = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
        const { privateKey: updatePrivateKey } = caver.klay.accounts.create()

        caver.klay.accounts.wallet.updatePrivateKey(updatePrivateKey, account.address)

        expect(caver.klay.accounts.wallet[account.index].privateKey).to.equals(updatePrivateKey)
        expect(caver.klay.accounts.wallet[account.address.toLowerCase()].privateKey).to.equals(updatePrivateKey)
        expect(caver.klay.accounts.wallet[account.address.toUpperCase()].privateKey).to.equals(updatePrivateKey)
    })

    it('CAVERJS-UNIT-WALLET-007 : If address is matched with in KlaytnWalletKey(non human readable), then extract privateKey to update in wallet.', () => {
        const account = caver.klay.accounts.wallet.add(caver.klay.accounts.create(), '0xee135d0b57c7ff81b198763cfd7c43f03a5f7622')
        const privateKey = '0x23da5d5eca4910b1f4721e2d685b1219cf8d104297bec5548f875a1b9800a43d'
        const updatePrivateKey =
            '0x23da5d5eca4910b1f4721e2d685b1219cf8d104297bec5548f875a1b9800a43d0x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'

        // send address parameter as a humanReadable string format.
        caver.klay.accounts.wallet.updatePrivateKey(updatePrivateKey, account.address)

        expect(caver.klay.accounts.wallet[account.index].privateKey).to.equals(privateKey)
        expect(caver.klay.accounts.wallet[account.address.toLowerCase()].privateKey).to.equals(privateKey)
        expect(caver.klay.accounts.wallet[account.address.toUpperCase()].privateKey).to.equals(privateKey)
    })

    it('CAVERJS-UNIT-WALLET-009 : If address is not matched return error.', () => {
        const account = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
        const updatePrivateKey =
            '0x23da5d5eca4910b1f4721e2d685b1219cf8d104297bec5548f875a1b9800a43d0x010x6a61736d696e652e6b6c6179746e000000000000'

        expect(() => caver.klay.accounts.wallet.updatePrivateKey(updatePrivateKey, account.address)).to.throws()
    })

    it('CAVERJS-UNIT-WALLET-010 : should throw error if there is not enough parameter.', () => {
        const updatePrivateKey =
            '0x23da5d5eca4910b1f4721e2d685b1219cf8d104297bec5548f875a1b9800a43d0x010x6a61736d696e652e6b6c6179746e000000000000'

        expect(() => caver.klay.accounts.wallet.updatePrivateKey()).to.throws()
        expect(() => caver.klay.accounts.wallet.updatePrivateKey(updatePrivateKey)).to.throws()
    })

    it('CAVERJS-UNIT-WALLET-011 : should throw error if privateKey is not string.', () => {
        caver.klay.accounts.wallet.add(caver.klay.accounts.create(), '0x5e008646fde91fb6eda7b1fdabc7d84649125cf5')
        expect(() =>
            caver.klay.accounts.wallet.updatePrivateKey(caver.klay.accounts.create(), '0x5e008646fde91fb6eda7b1fdabc7d84649125cf5')
        ).to.throws()
    })

    it('CAVERJS-UNIT-WALLET-012 : should throw error if there is no account information.', () => {
        const { privateKey: updatePrivateKey } = caver.klay.accounts.create()

        expect(() => caver.klay.accounts.wallet.updatePrivateKey(updatePrivateKey, caver.klay.accounts.create().address)).to.throws()
    })

    it('CAVERJS-UNIT-WALLET-013 : should throw error if privateKey is invalid.', () => {
        const account = caver.klay.accounts.wallet.add(caver.klay.accounts.create())

        expect(() => caver.klay.accounts.wallet.updatePrivateKey('invalidPrivateKey', account.address)).to.throws()
    })

    it('CAVERJS-UNIT-WALLET-014 : should throw error if privateKey has invalid length.', () => {
        const account = caver.klay.accounts.wallet.add(caver.klay.accounts.create())

        expect(() => caver.klay.accounts.wallet.updatePrivateKey(caver.utils.randomHex(31), account.address)).to.throws()
    })
})
