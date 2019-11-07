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

// const fs = typeof window !== 'object' && require('fs') || {}
const fs = {}

const DEFAULT_FILE_PATH = './'
const DEFAULT_FILE_NAME = 'rpcLogs'
const DEFAULT_FILE_EXTENSION = 'log'

const guaranteeFilePath = filePath => {
    return filePath.slice(-1) !== '/' ? `${filePath}/` : filePath
}

const appendToFile = (filePath, contents) => {
    fs.appendFileSync(filePath, `${contents}\n`, err => {
        if (err) throw err
    })
}

const fileLogger = (options = {}) => (data, next) => {
    if (typeof options !== 'object') {
        throw Error('file logger must take an object type argument.')
    }

    options.path = guaranteeFilePath(options.path) || DEFAULT_FILE_PATH
    options.name = options.name || DEFAULT_FILE_NAME
    options.extension = options.extension || DEFAULT_FILE_EXTENSION

    const fileName = `${options.path}${options.name}.${options.extension}`

    // Add timestamp for RPC request || response.
    data.timestamp = new Date().getTime()

    switch (options.extension) {
        case 'csv':
            // TODO: stringify to csv.
            appendToFile(fileName, JSON.stringify(data))
            break
        default:
            appendToFile(fileName, JSON.stringify(data))
    }

    next()
}

module.exports = fileLogger
