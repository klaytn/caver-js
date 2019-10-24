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

const BN = require('bn.js')
const { expect } = require('./extendedChai')

const Caver = require('../index.js')
const testRPCURL = require('./testrpc')

describe('utils.randomHex', done => {
    it('CAVERJS-UNIT-ETC-009 : Should throw an error with out of range size', async () => {
        const caver = new Caver(testRPCURL)

        const tooLowSize = -1
        const tooHighSize = 65537

        expect(() => caver.utils.randomHex(tooLowSize)).throw()
        expect(() => caver.utils.randomHex(tooHighSize)).throw()
    })
})
