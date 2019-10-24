/*
    Modifications copyright 2018 The caver-js Authors
    This file is part of the web3.js library.

    The web3.js library is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    The web3.js library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with the web3.js. If not, see <http://www.gnu.org/licenses/>.

    This file is derived from web3.js/test/iban.fromAddress.js (2019/06/12).
    Modified and improved for the caver-js development.
*/

const chai = require('chai')
const Iban = require('../packages/caver-utils/iban/src/index.js')

const assert = chai.assert

const tests = [
    { address: '00c5496aee77c1ba1f0854206a26dda82a81d6d8', expected: 'XE7338O073KYGTWWZN0F2WZ0R8PX5ZPPZS' },
    { address: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8', expected: 'XE7338O073KYGTWWZN0F2WZ0R8PX5ZPPZS' },
    { address: '0x11c5496aee77c1ba1f0854206a26dda82a81d6d8', expected: 'XE1222Q908LN1QBBU6XUQSO1OHWJIOS46OO' },
    { address: '0x52dc504a422f0e2a9e7632a34a50f1a82f8224c7', expected: 'XE499OG1EH8ZZI0KXC6N83EKGT1BM97P2O7' },
    { address: '0x0000a5327eab78357cbf2ae8f3d49fd9d90c7d22', expected: 'XE0600DQK33XDTYUCRI0KYM5ELAKXDWWF6' },
]

describe('caver-utils/iban', function() {
    describe('fromAddress', function() {
        tests.forEach(function(test) {
            it(`CAVERJS-UNIT-ETC-006 : shoud create indirect iban: ${test.expected}`, function() {
                assert.deepEqual(Iban.fromAddress(test.address), new Iban(test.expected))
            })
        })
    })
})
