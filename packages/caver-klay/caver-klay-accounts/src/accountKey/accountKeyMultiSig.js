const AccountKeyEnum = require('./accountKeyEnum').AccountKeyEnum

const MAX_MULTISIG_KEY_LENGTH = 10

class AccountKeyMultiSig {
    constructor(keys) {
        if (keys instanceof AccountKeyMultiSig) keys = keys.keys

        if (!Array.isArray(keys)) throw new Error('To create AccountKeyMultiSig, an array of private key strings is required.')
        if (keys.length === 0) throw new Error('Empty array.')
        if (keys.length > MAX_MULTISIG_KEY_LENGTH) throw new Error(`The maximum number of keys is ${MAX_MULTISIG_KEY_LENGTH}.`)
        if (isDuple(keys)) throw new Error('There is a duplicate key.')

        this._keys = keys
    }

    get type() {
        return AccountKeyEnum.ACCOUNT_KEY_MULTISIG
    }

    get defaultKey() {
        return this._keys[0]
    }

    get keys() {
        return this._keys
    }

    get transactionKey() {
        return this._keys
    }

    get updateKey() {
        return this._keys
    }

    get feePayerKey() {
        return this._keys
    }

    toPublicKey(toPublicKeyFunc) {
        const keys = []

        for (let i = 0; i < this._keys.length; i++) {
            const key = this._keys[i]
            keys.push(toPublicKeyFunc(key))
        }

        return keys
    }

    update(keys) {
        this._keys = keys.keys
    }
}

function isDuple(keys) {
    const map = new Map()
    for (const key of keys) {
        if (map.get(key) !== undefined) return true
        map.set(key, true)
    }
    return false
}

module.exports = AccountKeyMultiSig
