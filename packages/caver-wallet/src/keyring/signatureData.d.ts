export default class SignatureData {
    constructor(signature: string[] | SignatureData)

    emptySig: SignatureData

    isEmpty(): boolean
    encode(): string[]
    toString(): string

    get v(): string
    set v(v)
    get V(): string
    set V(v)
    get r(): string
    set r(r)
    get R(): string
    set R(r)
    get s(): string
    set s(s)
    get S(): string
    set S(s)
}