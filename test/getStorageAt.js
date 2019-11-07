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

describe('get storage at', done => {
    it('should not throw an error with string type parameter', async () => {
        const caver = new Caver('http://aspen.klaytn.com')
        const stroageInfo = await caver.klay.getStorageAt('0x9e6df5dbc96b2d4f5bee35fd99d832361360c82a', '1')
        expect(stroageInfo).to.exist
    })

    it('should not throw an error with number type parameter', async () => {
        const caver = new Caver('http://aspen.klaytn.com')
        const stroageInfo = await caver.klay.getStorageAt('0x9e6df5dbc96b2d4f5bee35fd99d832361360c82a', 1)
        expect(stroageInfo).to.exist
    })
})
