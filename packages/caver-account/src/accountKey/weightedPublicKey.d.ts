export default class WeightedPublicKey {
  constructor(weight: number, publicKey: string)

  encodeToBytes(): string

  get weight(): number
  set weight(w)
  get publicKey(): string
  set publicKey(p)
}