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

    This file is derived from web3.js/test/iban.toAddress.js (2019/06/12).
    Modified and improved for the caver-js development.
*/

const chai = require('chai')
const Iban = require('../packages/caver-utils/iban/src/index.js')

const assert = chai.assert

const tests = [{ direct: 'XE7338O073KYGTWWZN0F2WZ0R8PX5ZPPZS', address: '0x00c5496aEe77C1bA1f0854206A26DdA82a81D6D8' }]

describe('caver-utils/iban', function() {
    describe('toAddress', function() {
        tests.forEach(function(test) {
            it(`CAVERJS-UNIT-ETC-008 : shoud transform iban to address: ${test.address}`, function() {
                const iban = new Iban(test.direct)
                assert.deepEqual(iban.toAddress(), test.address)
            })
        })
    })
})
