import WeightedMultiSigOptions from './weightedMultiSigOptions'

export const ACCOUNT_KEY_TAG: {
  ACCOUNT_KEY_NIL_TAG: '0x80'
  ACCOUNT_KEY_LEGACY_TAG: '0x01c0'
  ACCOUNT_KEY_PUBLIC_TAG: '0x02'
  ACCOUNT_KEY_FAIL_TAG: '0x03c0'
  ACCOUNT_KEY_WEIGHTED_MULTISIG_TAG: '0x04'
  ACCOUNT_KEY_ROLE_BASED_TAG: '0x05'
}

export function fillWeightedMultiSigOptionsForMultiSig(lengthOfKeys: number, options?: WeightedMultiSigOptions | object): WeightedMultiSigOptions

export function fillWeightedMultiSigOptionsForRoleBased(lengthOfKeys: number[], options?: WeightedMultiSigOptions[] | object[]): WeightedMultiSigOptions[]
