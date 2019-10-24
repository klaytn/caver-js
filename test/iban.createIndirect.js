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

    This file is derived from web3.js/test/iban.createIndirect.js (2019/06/12).
    Modified and improved for the caver-js development.
*/

const chai = require('chai')
const Iban = require('../packages/caver-utils/iban/src/index.js')

const assert = chai.assert

const tests = [{ institution: 'XREG', identifier: 'GAVOFYORK', expected: 'XE81ETHXREGGAVOFYORK' }]

describe('caver-utils/iban/src/index', function() {
    describe('createIndirect', function() {
        tests.forEach(function(test) {
            it(`CAVERJS-UNIT-ETC-005 : shoud create indirect iban: ${test.expected}`, function() {
                assert.deepEqual(
                    Iban.createIndirect({
                        institution: test.institution,
                        identifier: test.identifier,
                    }),
                    new Iban(test.expected)
                )
            })
        })
    })
})
