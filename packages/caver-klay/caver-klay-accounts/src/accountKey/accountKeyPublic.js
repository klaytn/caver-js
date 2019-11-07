const AccountKeyEnum = require('./accountKeyEnum').AccountKeyEnum

class AccountKeyPublic {
    constructor(key) {
        if (key instanceof AccountKeyPublic) key = key.keys

        if (typeof key !== 'string') throw new Error('To create AccountKeyPublic, a private key strings is required.')
        this._key = key
    }

    get type() {
        return AccountKeyEnum.ACCOUNT_KEY_PUBLIC
    }

    get defaultKey() {
        return this._key
    }

    get keys() {
        return this._key
    }

    get transactionKey() {
        return this._key
    }

    get updateKey() {
        return this._key
    }

    get feePayerKey() {
        return this._key
    }

    toPublicKey(toPublicKeyFunc) {
        return toPublicKeyFunc(this._key)
    }

    update(key) {
        this._key = key.keys
    }
}

module.exports = AccountKeyPublic
