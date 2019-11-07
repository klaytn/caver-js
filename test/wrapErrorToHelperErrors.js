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
const { errors } = require('../packages/caver-core-helpers')

const testRPCURL = require('./testrpc')

const Caver = require('../index.js')

const caver = new Caver(testRPCURL)

describe('wrap error to core-helper/errors', () => {
    it('should be thrown property missing error when "call" missing', done => {
        expect(() => new caver.Method({ name: 'hi' })).to.throw(errors.needNameCallPropertyToCreateMethod)
        done()
    })

    it('should be thrown property missing error when "name" missing', done => {
        expect(() => new caver.Method({ call: 'hi' })).to.throw(errors.needNameCallPropertyToCreateMethod)
        done()
    })

    it('should not be thrown property missing error when "name", "call" existing', done => {
        expect(() => new caver.Method({ name: 'hi', call: 'hi' })).not.to.throw(errors.needNameCallPropertyToCreateMethod)
        done()
    })
})
