export interface EncryptedKey {
    ciphertext: string
    cipherparams: {
        iv: string
    },
    cipher: string
    kdf: string
    kdfparams: EncryptedKey
    mac: string
}

export interface EncryptedKeyOptions {
    salt: any
    iv: any
    kdf: any
    dklen: any
    c: any
    n: any
    r: any
    p: any
    cipher: any
    uuid: any
}
    

export interface Keystore {
    version: number
    id: string
    address: string
    crypto?: EncryptedKey[]
    keyring?: EncryptedKey[][]
}

export const KEY_ROLE: {
    roleTransactionKey: 0
    0: 'roleTransactionKey'
    roleAccountUpdateKey: 1
    1: 'roleAccountUpdateKey'
    roleFeePayerKey: 2
    2: 'roleFeePayerKey'
    roleLast: 3
}

export const MAXIMUM_KEY_NUM = 10

export function isMultipleKeysFormat(keys: string): boolean
export function isRoleBasedKeysFormat(roledBasedKeyArray: string[]): boolean
export function validateForSigning(hash: string, chainId: string): void
export function validateIndexWithKeys(index: number, keyLength: number): void
export function decryptKey(encryptedArray: EncryptedKey[], password: string): string[]
export function encryptKey(privateKey: string, password: string, options: EncryptedKey): EncryptedKey
export function formatEncrypted(version: number, address: string, keyringOrCrypto: any, options: any): Keystore