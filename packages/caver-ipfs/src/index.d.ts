
import lodash from 'lodash'
import fs from 'fs'
import IPFSAPI from 'ipfs-api'
import multihash from 'multihashes'

/**
 * Representing a class for uploading and loading files to IPFS.
 * @class
 */
export default class IPFS {
    /**
     * Create an IPFS.
     * @param {string} host The host url.
     * @param {number} port The port number to use.
     * @param {boolean} ssl With or without SSL.
     */
    constructor(host: string, port: number, ssl: boolean)

    /**
     * sets a IPFS Node
     *
     * @param {string} host The host url.
     * @param {number} port The port number to use.
     * @param {boolean} ssl With or without SSL.
     * @return {void}
     */
    setIPFSNode(host: string, port: number, ssl: boolean): void

    /**
     * adds a file to IPFS
     *
     * @param {string|Buffer} data The file path string or file contents.
     * @return {string}
     */
    async add(data: string | Buffer): string

    /**
     * gets a file from IPFS
     *
     * @param {string} hash The file hash string.
     * @return {Buffer}
     */
    async get(hash: string): Buffer

    /**
     * converts a hash to hex format.
     *
     * @param {string} hash The file hash string.
     * @return {string}
     */
    toHex(hash: string): string

    /**
     * converts from a hex format.
     *
     * @param {string} hash The file hash string in hex format.
     * @return {string}
     */
    fromHex(contentHash): string
}

