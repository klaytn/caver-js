const { expect } = require('./extendedChai')
const assert = require('assert')
const Caver = require('../index')

let caver

describe('Connection error test', () => {
    it('host url is invalid, return connection error.', async () => {
        caver = new Caver(new Caver.providers.HttpProvider('invalid:1234', { timeout: 5000 }))
        try {
            await caver.klay.getNodeInfo()
            assert(false)
        } catch(err) {
            expect(err.message).to.equals('CONNECTION ERROR: Couldn\'t connect to node invalid:1234.')
        }
    }).timeout(10000)
})

describe('Invalid response test', () => {
    it('without timeout return Invalid response: null error.', async () => {
        caver = new Caver('http://localhost:1234/')
        try {
            await caver.klay.getNodeInfo()
            assert(false)
        } catch(err) {
            expect(err.message).to.equals('Invalid response: null')
        }
    })

    it('with timeout return Invalid response: null error.', async () => {
        caver = new Caver(new Caver.providers.HttpProvider('http://localhost:1234/', { timeout: 5000 }))
        try {
            await caver.klay.getNodeInfo()
            assert(false)
        } catch(err) {
            expect(err.message).to.equals('Invalid response: null')
        }
    })
})
