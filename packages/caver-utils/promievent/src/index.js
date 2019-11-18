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

    This file is derived from web3.js/packages/web3-core-promievent/src/index.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/**
 * @file index.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2016
 */

const EventEmitter = require('eventemitter3')

const mergeEmitterProp = obj => {
    const emitter = new EventEmitter()
    Object.entries(emitter.__proto__).reduce((acc, [k, v]) => ((acc[k] = v), acc), obj)

    obj._events = emitter._events
    obj._eventsCount = emitter._eventsCount
    return obj
}

function PromiEvent(promiseOnly) {
    let resolve
    let reject
    const promiseInstance = new Promise((resolver, rejecter) => {
        resolve = resolver
        reject = rejecter
    })

    const eventEmitter = promiseOnly ? promiseInstance : mergeEmitterProp(promiseInstance)

    return {
        resolve,
        reject,
        eventEmitter: eventEmitter,
    }
}

PromiEvent.resolve = function(value) {
    const promise = PromiEvent(true) // promiseOnly
    promise.resolve(value)
    return promise.eventEmitter
}

module.exports = PromiEvent
