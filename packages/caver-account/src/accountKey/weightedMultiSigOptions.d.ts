export type WeightedMultiSigOptionsObject = {
  threshold?: number
  weights?: number[]
  weight?: number[]
}

export default class WeightedMultiSigOptions {
  constructor(threshold?: number, weights?: number[])

  static fromObject(options: WeightedMultiSigOptionsObject): WeightedMultiSigOptions
  isEmpty(): boolean

  get threshold(): number
  set threshold(th)
  get weights(): number[]
  set weights(weightArr)
}