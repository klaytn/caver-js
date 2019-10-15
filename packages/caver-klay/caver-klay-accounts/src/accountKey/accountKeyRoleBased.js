const AccountKeyEnum = require('./accountKeyEnum').AccountKeyEnum
const AccountKeyPublic = require('./accountKeyPublic')
const AccountKeyMultiSig = require('./accountKeyMultiSig')

class AccountKeyRoleBased {
	constructor(keyObj = {}) {
		if (keyObj instanceof AccountKeyRoleBased) keyObj = keyObj.keys
		
		if (typeof keyObj !== 'object') throw new Error('RoleBasedKey should be created with Object')

		this._transactionKey = makeAccountKey(keyObj.transactionKey)
		this._updateKey = makeAccountKey(keyObj.updateKey)
		this._feePayerKey = makeAccountKey(keyObj.feePayerKey)
	}

	get type() { return AccountKeyEnum.ACCOUNT_KEY_ROLEBASED }

	get defaultKey() { 
		let definedKey = this._transactionKey? this._transactionKey : this._updateKey? this._updateKey : this._feePayerKey? this._feePayerKey : undefined

		if (!definedKey) throw new Error(`There is no key defined in AccountKeyRoleBased.`)

        return definedKey.defaultKey
	}

	get keys() {
		const keys = {}

		if (this._transactionKey !== undefined) keys.transactionKey = this._transactionKey.keys
		if (this._updateKey !== undefined) keys.updateKey = this._updateKey.keys
		if (this._feePayerKey !== undefined) keys.feePayerKey = this._feePayerKey.keys

		return keys
	}

	get transactionKey() { 
		if (!this._transactionKey) return undefined
		return this._transactionKey.keys 
	}
	get updateKey() { 
		if (!this._updateKey) return undefined
		return this._updateKey.keys 
	}
	get feePayerKey() { 
		if (!this._feePayerKey) return undefined
		return this._feePayerKey.keys 
	}

	toPublicKey(toPublicKeyFunc) {
		const returnObject = {}

        if (this._transactionKey !== undefined) returnObject.transactionKey = this._transactionKey.toPublicKey(toPublicKeyFunc)
		if (this._updateKey !== undefined) returnObject.updateKey = this._updateKey.toPublicKey(toPublicKeyFunc)
		if (this._feePayerKey !== undefined) returnObject.feePayerKey = this._feePayerKey.toPublicKey(toPublicKeyFunc)
		
		return returnObject
	}

	update(keys) {
		// In the case of AccountKeyRoleBased, the key that does not update is not defined.
		// To handle this case, when updating, only update the key for the defined role.
		if (keys._transactionKey) this._transactionKey = keys._transactionKey
		if (keys._updateKey) this._updateKey = keys._updateKey
		if (keys._feePayerKey) this._feePayerKey = keys._feePayerKey
	}
}

function makeAccountKey(key) {
	if (key === undefined) return undefined
	if (Array.isArray(key) || key instanceof AccountKeyMultiSig) return new AccountKeyMultiSig(key)
	if (typeof key !== 'string') throw new Error('Invalid account key type')

	return new AccountKeyPublic(key)
}

module.exports = AccountKeyRoleBased