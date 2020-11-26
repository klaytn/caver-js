/*
    Copyright 2019 The caver-js Authors
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

const Caver = require('../index')
const { expect } = require('./extendedChai')

const host1URL = 'http://random1.test.host:8551/'
const host1 = new Caver(host1URL)
const host2URL = 'https://random2.test.host:8651/'
const host2 = new Caver(host2URL)

describe('Test multi provider', () => {
    it('CAVERJS-UNIT-ETC-077: For each provider, the request must be processed using its own requestManager.', async () => {
        expect(host1.klay.currentProvider.host).to.equals(host1URL)
        expect(host1.klay.net.currentProvider.host).to.equals(host1URL)
        expect(host1.klay.personal.currentProvider.host).to.equals(host1URL)
        expect(host1.klay.Contract.currentProvider.host).to.equals(host1URL)
        expect(host1.klay.accounts.currentProvider.host).to.equals(host1URL)

        expect(host2.klay.currentProvider.host).to.equals(host2URL)
        expect(host2.klay.net.currentProvider.host).to.equals(host2URL)
        expect(host2.klay.personal.currentProvider.host).to.equals(host2URL)
        expect(host2.klay.Contract.currentProvider.host).to.equals(host2URL)
        expect(host2.klay.accounts.currentProvider.host).to.equals(host2URL)
    }).timeout(10000)
})
