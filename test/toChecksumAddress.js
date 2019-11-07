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
const Caver = require('../index.js')
const testRPCURL = require('./testrpc')

describe('Checksum address', done => {
    it('CAVERJS-UNIT-ETC-016 : should convert to vaild checksum address', async () => {
        const caver = new Caver(testRPCURL)

        const address1 = '0xc1912fee45d61c87cc5ea59dae31190fffff232d'
        const address2 = '0XC1912FEE45D61C87CC5EA59DAE31190FFFFF232D'

        expect(caver.utils.toChecksumAddress(address1)).to.equal('0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d')

        expect(caver.utils.toChecksumAddress(address2)).to.equal('0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d')
    })
})
