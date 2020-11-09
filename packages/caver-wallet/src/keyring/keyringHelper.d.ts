
export type KEY_ROLE = {
    roleTransactionKey: number;
    0: string;
    roleAccountUpdateKey: number;
    1: string;
    roleFeePayerKey: number;
    2: string;
    roleLast: number;
}

export type MAXIMUM_KEY_NUM = number

export type isMultipleKeysFormat = (keys: any) => boolean

export type isRoleBasedKeysFormat = (roledBasedKeyArray: any) => boolean

export type validateForSigning = (hash: any, chainId: any) => void

export type validateIndexWithKeys = (index: any, keyLength: any) => void

export type decryptKey = (encryptedArray: any, password: any) => never[] | undefined

export type encryptKey = (privateKey: any, password: any, options: any) => never[]

export type formatEncrypted = (version: any, address: any, keyringOrCrypto: any, options: any) => {
    version: any;
    id: any;
    address: any;
}

export const KEY_ROLE: {
    roleTransactionKey: number;
    0: string;
    roleAccountUpdateKey: number;
    1: string;
    roleFeePayerKey: number;
    2: string;
    roleLast: number;
}

export const MAXIMUM_KEY_NUM: number

export const isMultipleKeysFormat: (keys: any) => boolean

export const isRoleBasedKeysFormat: (roledBasedKeyArray: any) => boolean

export const validateForSigning: (hash: any, chainId: any) => void

export const validateIndexWithKeys: (index: any, keyLength: any) => void

export const decryptKey: (encryptedArray: any, password: any) => never[] | undefined

export const encryptKey: (privateKey: any, password: any, options: any) => never[]

export const formatEncrypted: (version: any, address: any, keyringOrCrypto: any, options: any) => {
    version: any;
    id: any;
    address: any;
}