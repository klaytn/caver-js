export default class IPFS {
    constructor(host: string, port: number, ssl: boolean)

    setIPFSNode(host: string, port: number, ssl: boolean): void
    add(data: string | Buffer | ArrayBuffer): Promise<string>
    get(hash: string): Promise<Buffer>
    toHex(hash: string): string
    fromHex(contentHash: string): string
}