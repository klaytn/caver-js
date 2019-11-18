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

    This file is derived from web3.js/test/iban.isValid.js (2019/06/12).
    Modified and improved for the caver-js development.
*/

const chai = require('chai')
const Iban = require('../packages/caver-utils/iban/src/index.js')

const assert = chai.assert

const tests = [
    { obj() {}, is: false },
    { obj: () => {}, is: false },
    { obj: 'function', is: false },
    { obj: {}, is: false },
    { obj: '[]', is: false },
    { obj: '[1, 2]', is: false },
    { obj: '{}', is: false },
    { obj: '{"a": 123, "b" :3,}', is: false },
    { obj: '{"c" : 2}', is: false },
    { obj: 'XE81ETHXREGGAVOFYORK', is: true },
    { obj: 'XE82ETHXREGGAVOFYORK', is: false }, // control number is invalid
    { obj: 'XE81ETCXREGGAVOFYORK', is: false },
    { obj: 'XE81ETHXREGGAVOFYORKD', is: false },
    { obj: 'XE81ETHXREGGaVOFYORK', is: false },
    { obj: 'XE7338O073KYGTWWZN0F2WZ0R8PX5ZPPZS', is: true },
    { obj: 'XE7438O073KYGTWWZN0F2WZ0R8PX5ZPPZS', is: false }, // control number is invalid
    { obj: 'XD7338O073KYGTWWZN0F2WZ0R8PX5ZPPZS', is: false },
    { obj: 'XE1222Q908LN1QBBU6XUQSO1OHWJIOS46OO', is: true },
]

describe('caver-utils/iban', function() {
    describe('isValid', function() {
        tests.forEach(function(test) {
            it(`CAVERJS-UNIT-ETC-007 : shoud test if value ${test.obj} is iban: ${test.is}`, function() {
                assert.equal(Iban.isValid(test.obj), test.is)
            })
        })
    })
})
