import Caver from '../index'

let TRANSACTION: any

const caver = new Caver('')
{
    // caver.account
    const account = caver.account
    const accountKeyLegacy = new caver.account.accountKey.accountKeyLegacy()
    const accountKeyPublic = new caver.account.accountKey.accountKeyPublic('')
    const accountKeyFail = new caver.account.accountKey.accountKeyFail()
    const accountKeyWeightedMultiSig = new caver.account.accountKey.accountKeyWeightedMultiSig(0, [])
    const accountKeyRoleBased = new caver.account.accountKey.accountKeyRoleBased([])
    const weightedPublicKey = new caver.account.accountKey.weightedPublicKey(0, '')
    const weightedMultiSigOptions = new caver.account.weightedMultiSigOptions(0, [])
    const accountInstance = new caver.account(
        '',
        accountKeyLegacy || accountKeyPublic || accountKeyFail || accountKeyWeightedMultiSig || accountKeyRoleBased
    )
    const create = caver.account.create('0x{address in hex}', '0x034f1...')
    const createFromRLPEncoding = caver.account.createFromRLPEncoding(
        '0x{address in hex}',
        '0x04f84b02f848e301a102c10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9e301a1021769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c1'
    )
    const createWithAccountKeyLegacy = caver.account.createWithAccountKeyLegacy('0x{address in hex}')
    const createWithAccountKeyPublic = caver.account.createWithAccountKeyPublic('0x{address in hex}', '0xb5a9a...')
    const createWithAccountKeyFail = caver.account.createWithAccountKeyFail('0x{address in hex}')
    const createWithAccountKeyWeightedMultiSig = caver.account.createWithAccountKeyWeightedMultiSig('0x{address in hex}', [
        '0xb5a9a...',
        '0xfe4b8...',
    ])
    const createWithAccountKeyRoleBased = caver.account.createWithAccountKeyRoleBased('0x{address in hex}', [
        ['0x034f1...', '0xfe4b8...'],
        ['0xb5a9a...'],
        ['0x034f1...', '0xb5a9a...'],
    ])
    const decode = caver.account.accountKey.decode('0x02a102c10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9')
    const getRLPEncodingAccountKey = create.getRLPEncodingAccountKey()
}

{
    // caver.wallet.keyring
    const wallet_keyring = caver.wallet.keyring
    const generate = caver.wallet.generate(3, caver.utils.randomHex(32))
    const newKeyring = caver.wallet.newKeyring('0x{address in hex}', '0x{private key}')
    const updateKeyring = caver.wallet.updateKeyring(newKeyring)
    const getKeyring = caver.wallet.getKeyring('0x386a4bb40abbfaa59cecdc3ced202475895fd569')
    const add = caver.wallet.add(newKeyring)
    const remove = caver.wallet.remove('0x6a3edfad6d1126020d5369e9097db39281876c5d')
    const signMessage = caver.wallet.signMessage(
        '0x386a4bb40abbfaa59cecdc3ced202475895fd569',
        'message to sign',
        caver.wallet.keyring.role.roleTransactionKey
    )

    const sign = caver.wallet.sign('0xe7e9184c125020af5d34eab7848bab799a1dcba9', TRANSACTION)
    const signAsFeePayer = caver.wallet.signAsFeePayer('0xe7e9184c125020af5d34eab7848bab799a1dcba9', TRANSACTION)
}

{
    // caver.wallet
    const wallet = caver.wallet
    const singleKeyring = new caver.wallet.keyring.singleKeyring('', '')
    const multipleKeyring = new caver.wallet.keyring.multipleKeyring('', [''])
    const roleBasedKeyring = new caver.wallet.keyring.roleBasedKeyring('', [['']])
    const privateKey = new caver.wallet.keyring.privateKey('')
    const signatureData = new caver.wallet.keyring.signatureData(['0x1b', '0x2dfc6...', '0x15038...'])
    const generate = caver.wallet.keyring.generate()
    const generateSingleKey = caver.wallet.keyring.generateSingleKey('')
    const generateMultipleKeys = caver.wallet.keyring.generateMultipleKeys(3)
    const generateRoleBasedKeys = caver.wallet.keyring.generateRoleBasedKeys([2, 1, 3])
    const create = caver.wallet.keyring.create('0x{address in hex}', '0x{private key}')
    const createFromPrivateKey = caver.wallet.keyring.createFromPrivateKey('0x{private key}')
    const createFromKlaytnWalletKey = caver.wallet.keyring.createFromKlaytnWalletKey('0x{private key}0x{type}0x{address in hex}')
    const createWithSingleKey = caver.wallet.keyring.createWithSingleKey('0x{address in hex}', '0x{private key}')
    const createWithMultipleKey = caver.wallet.keyring.createWithMultipleKey('0x{address in hex}', ['0x{private key1}', '0x{private key2}'])
    const roleBasedKeys = [
        ['0x{private key1}', '0x{private key2}'],
        ['0x{private key3}', '0x{private key4}'],
        ['0x{private key5}', '0x{private key6}'],
    ]
    const createWithRoleBasedKey = caver.wallet.keyring.createWithRoleBasedKey('0x{address in hex}', roleBasedKeys)
    const decrypt = caver.wallet.keyring.decrypt(
        {
            version: 4,
            id: '9c12de05-0153-41c7-a8b7-849472eb5de7',
            address: '0xc02cec4d0346bf4124deeb55c5216a4138a40a8c',
            keyring: [
                {
                    ciphertext: 'eacf496cea5e80eca291251b3743bf93cdbcf7072efc3a74efeaf518e2796b15',
                    cipherparams: { iv: 'd688a4319342e872cefcf51aef3ec2da' },
                    cipher: 'aes-128-ctr',
                    kdf: 'scrypt',
                    kdfparams: {
                        dklen: 32,
                        salt: 'c3cee502c7157e0faa42386c6d666116ffcdf093c345166c502e23bc34e6ba40',
                        n: 4096,
                        r: 8,
                        p: 1,
                    },
                    mac: '4b49574f3d3356fa0d04f73e07d5a2a6bbfdd185bedfa31f37f347bc98f2ef26',
                },
            ],
        },
        'password'
    )
    const getPublicKey = singleKeyring.getPublicKey() || multipleKeyring.getPublicKey() || roleBasedKeyring.getPublicKey()
    const copy = singleKeyring.copy() || multipleKeyring.copy() || roleBasedKeyring.copy()
    const sign =
        singleKeyring.sign(
            '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550',
            '0x2810',
            caver.wallet.keyring.role.roleTransactionKey
        ) ||
        multipleKeyring.sign(
            '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550',
            '0x2810',
            caver.wallet.keyring.role.roleTransactionKey
        ) ||
        roleBasedKeyring.sign(
            '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550',
            '0x2810',
            caver.wallet.keyring.role.roleTransactionKey
        )
    const signMessage =
        singleKeyring.signMessage('message to sign', caver.wallet.keyring.role.roleTransactionKey) ||
        multipleKeyring.signMessage('message to sign', caver.wallet.keyring.role.roleTransactionKey) ||
        roleBasedKeyring.signMessage('message to sign', caver.wallet.keyring.role.roleTransactionKey)
    const getKlaytnWalletKey =
        singleKeyring.getKlaytnWalletKey() || multipleKeyring.getKlaytnWalletKey() || roleBasedKeyring.getKlaytnWalletKey()
    const toAccount = singleKeyring.toAccount() || multipleKeyring.toAccount() || roleBasedKeyring.toAccount()
    const encrypt = singleKeyring.encrypt('password') || multipleKeyring.encrypt('password') || roleBasedKeyring.encrypt('password')
    const encryptV3 = singleKeyring.encryptV3('password') || multipleKeyring.encryptV3('password') || roleBasedKeyring.encryptV3('password')
    const isDecoupled = singleKeyring.isDecoupled() || multipleKeyring.isDecoupled() || roleBasedKeyring.isDecoupled()
}

{
    // caver.transaction
    const transaction = caver.transaction
    const decode = caver.transaction.decode('0x08f87...')
    const roleBasedKeyring = new caver.wallet.keyring.roleBasedKeyring('', [['']])
    const valueTransfer = new caver.transaction.valueTransfer({
        from: '0xe7e9184c125020af5d34eab7848bab799a1dcba9',
        to: '0x3424b91026bdc5ec55df4548e6ebf0f28b60abd7',
        value: '1',
        gas: '30000',
    })
    valueTransfer.sign(roleBasedKeyring)
    const feeDelegatedValueTransfer = new caver.transaction.feeDelegatedValueTransfer({
        from: '0x6fddbcb99d31b8755c2b840a367f53eea4b4f45c',
        to: '0x3424b91026bdc5ec55df4548e6ebf0f28b60abd7',
        value: 1,
        gas: 30000,
    })
    feeDelegatedValueTransfer.signAsFeePayer(roleBasedKeyring)

    valueTransfer.appendSignatures(['0x4e44', '0x7010e...', '0x65d6b...'])
    feeDelegatedValueTransfer.appendSignatures(['0x4e44', '0x7010e...', '0x65d6b...'])
    feeDelegatedValueTransfer.appendFeePayerSignatures(['0x4e44', '0x7010e...', '0x65d6b...'])
    const combineSignedRawTransactions = feeDelegatedValueTransfer.combineSignedRawTransactions(['0x09f88...'])
    const getRLPEncoding = feeDelegatedValueTransfer.getRLPEncoding()
    const getRawTransaction = feeDelegatedValueTransfer.getRawTransaction()
    const getTransactionHash = feeDelegatedValueTransfer.getTransactionHash()
    const getSenderTxHash = feeDelegatedValueTransfer.getSenderTxHash()
    const getRLPEncodingForSignature = feeDelegatedValueTransfer.getRLPEncodingForSignature()
    const getRLPEncodingForFeePayerSignature = feeDelegatedValueTransfer.getRLPEncodingForFeePayerSignature()
    const fillTransaction = feeDelegatedValueTransfer.fillTransaction()
}

{
    // caver.rpc
    const rpc = caver.rpc
    const accountCreated = caver.rpc.klay.accountCreated
    const getAccount = caver.rpc.klay.getAccount
    const getAccountKey = caver.rpc.klay.getAccountKey
    const encodeAccountKey = caver.rpc.klay.encodeAccountKey
    const decodeAccountKey = caver.rpc.klay.decodeAccountKey
    const getBalance = caver.rpc.klay.getBalance
    const getCode = caver.rpc.klay.getCode
    const getTransactionCount = caver.rpc.klay.getTransactionCount
    const isContractAccount = caver.rpc.klay.isContractAccount
    const sign = caver.rpc.klay.sign
    const getAccounts = caver.rpc.klay.getAccounts
    const getBlockNumber = caver.rpc.klay.getBlockNumber
    const getBlockByNumber = caver.rpc.klay.getBlockByNumber
    const getBlockByHash = caver.rpc.klay.getBlockByHash
    const getBlockReceipts = caver.rpc.klay.getBlockReceipts
    const getBlockTransactionCountByNumber = caver.rpc.klay.getBlockTransactionCountByNumber
    const getBlockTransactionCountByHash = caver.rpc.klay.getBlockTransactionCountByHash
    const getBlockWithConsensusInfoByNumber = caver.rpc.klay.getBlockWithConsensusInfoByNumber
    const getBlockWithConsensusInfoByHash = caver.rpc.klay.getBlockWithConsensusInfoByHash
    const getCommittee = caver.rpc.klay.getCommittee
    const getCommitteeSize = caver.rpc.klay.getCommitteeSize
    const getCouncil = caver.rpc.klay.getCouncil
    const getCouncilSize = caver.rpc.klay.getCouncilSize
    const getStorageAt = caver.rpc.klay.getStorageAt
    const isSyncing = caver.rpc.klay.isSyncing
    const call = caver.rpc.klay.call
    const estimateGas = caver.rpc.klay.estimateGas
    const estimateComputationCost = caver.rpc.klay.estimateComputationCost
    const getTransactionByBlockHashAndIndex = caver.rpc.klay.getTransactionByBlockHashAndIndex
    const getTransactionByBlockNumberAndIndex = caver.rpc.klay.getTransactionByBlockNumberAndIndex
    const getTransactionByHash = caver.rpc.klay.getTransactionByHash
    const getTransactionBySenderTxHash = caver.rpc.klay.getTransactionBySenderTxHash
    const getTransactionReceipt = caver.rpc.klay.getTransactionReceipt
    const getTransactionReceiptBySenderTxHash = caver.rpc.klay.getTransactionReceiptBySenderTxHash
    const sendRawTransaction = caver.rpc.klay.sendRawTransaction
    const sendTransaction = caver.rpc.klay.sendTransaction
    const sendTransactionAsFeePayer = caver.rpc.klay.sendTransactionAsFeePayer
    const signTransaction = caver.rpc.klay.signTransaction
    const signTransactionAsFeePayer = caver.rpc.klay.signTransactionAsFeePayer
    const getDecodedAnchoringTransactionByHash = caver.rpc.klay.getDecodedAnchoringTransactionByHash
    const getChainId = caver.rpc.klay.getChainId
    const getClientVersion = caver.rpc.klay.getClientVersion
    const getGasPrice = caver.rpc.klay.getGasPrice
    const getGasPriceAt = caver.rpc.klay.getGasPriceAt
    const isParallelDBWrite = caver.rpc.klay.isParallelDBWrite
    const isSenderTxHashIndexingEnabled = caver.rpc.klay.isSenderTxHashIndexingEnabled
    const getProtocolVersion = caver.rpc.klay.getProtocolVersion
    const getRewardbase = caver.rpc.klay.getRewardbase
    const isWriteThroughCaching = caver.rpc.klay.isWriteThroughCaching
    const getFilterChanges = caver.rpc.klay.getFilterChanges
    const getFilterLogs = caver.rpc.klay.getFilterLogs
    const getLogs = caver.rpc.klay.getLogs
    const newBlockFilter = caver.rpc.klay.newBlockFilter
    const newFilter = caver.rpc.klay.newFilter
    const newPendingTransactionFilter = caver.rpc.klay.newPendingTransactionFilter
    const uninstallFilter = caver.rpc.klay.uninstallFilter
    const sha3 = caver.rpc.klay.sha3

    const getNetworkId = caver.rpc.net.getNetworkId
    const isListening = caver.rpc.net.isListening
    const getPeerCount = caver.rpc.net.getPeerCount
    const getPeerCountByType = caver.rpc.net.getPeerCountByType
}

{
    // caver.contract
    const contract = caver.contract
    const myContract = new caver.contract([{}], '0x{address in hex}', { gasPrice: '25000000000' })
    const options = myContract.options
    const clone = myContract.clone()
    const deploy = myContract.deploy({
        data: '0x12345...',
        arguments: [123, 'My string'],
    })
    const once = myContract.once(
        'eventName',
        {
            filter: { myIndexedParam: [20, 23], myOtherIndexedParam: '0x123456789...' }, // Using an array means OR: e.g. 20 or 23
        },
        function(error: any, event: any) {
            console.log(event)
        }
    )
    const events = myContract.events.eventName(
        {
            filter: { myIndexedParam: [20, 23], myOtherIndexedParam: '0x123456789...' }, // Using an array means OR: e.g. 20 or 23
            fromBlock: 0,
        },
        function(error: any, event: any) {
            console.log(event)
        }
    )
    myContract.getPastEvents(
        'eventName',
        {
            filter: { myIndexedParam: [20, 23], myOtherIndexedParam: '0x123456789...' }, // Using an array means OR: e.g. 20 or 23
            fromBlock: 0,
            toBlock: 'latest',
        },
        function(error: any, event: any) {
            console.log(events)
        }
    )
}

{
    // caver.abi
    const abi = caver.abi
    const encodeFunctionSignature = caver.abi.encodeFunctionSignature({
        name: 'myMethod',
        type: 'function',
        inputs: [
            {
                type: 'uint256',
                name: 'myNumber',
            },
            {
                type: 'string',
                name: 'mystring',
            },
        ],
    })
    const encodeEventSignature = caver.abi.encodeEventSignature({
        name: 'myEvent',
        type: 'event',
        inputs: [
            {
                type: 'uint256',
                name: 'myNumber',
            },
            {
                type: 'bytes32',
                name: 'myBytes',
            },
        ],
    })
    const encodeParameter = caver.abi.encodeParameter('uint256', '2345675643')
    const encodeParameters = caver.abi.encodeParameters(['uint256', 'string'], ['2345675643', 'Hello!%'])
    const encodeFunctionCall = caver.abi.encodeFunctionCall(
        {
            name: 'myMethod',
            type: 'function',
            inputs: [
                {
                    type: 'uint256',
                    name: 'myNumber',
                },
                {
                    type: 'string',
                    name: 'mystring',
                },
            ],
        },
        ['2345675643', 'Hello!%']
    )
    const decodeParameter = caver.abi.decodeParameter('uint256', '0x0000000000000000000000000000000000000000000000000000000000000010')
    const decodeParameters = caver.abi.decodeParameters(
        ['string', 'uint256'],
        '0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000ea000000000000000000000000000000000000000000000000000000000000000848656c6c6f212521000000000000000000000000000000000000000000000000'
    )
    const decodeLog = caver.abi.decodeLog(
        [
            {
                type: 'string',
                name: 'mystring',
            },
            {
                type: 'uint256',
                name: 'myNumber',
                indexed: true,
            },
            {
                type: 'uint8',
                name: 'mySmallNumber',
                indexed: true,
            },
        ],
        '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000748656c6c6f252100000000000000000000000000000000000000000000000000',
        [
            '0x000000000000000000000000000000000000000000000000000000000000f310',
            '0x0000000000000000000000000000000000000000000000000000000000000010',
        ]
    )
    const encodeContractDeploy = caver.abi.encodeContractDeploy(
        [
            {
                constant: true,
                inputs: [],
                name: 'count',
                outputs: [{ name: '', type: 'uint256' }],
                payable: false,
                stateMutability: 'view',
                type: 'function',
            },
            {
                constant: true,
                inputs: [],
                name: 'getBlockNumber',
                outputs: [{ name: '', type: 'uint256' }],
                payable: false,
                stateMutability: 'view',
                type: 'function',
            },
            {
                constant: false,
                inputs: [{ name: '_count', type: 'uint256' }],
                name: 'setCount',
                outputs: [],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'function',
            },
        ],
        '0x60806040526000805534801561001457600080fd5b50610116806100246000396000f3006080604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd14605857806342cbb15c146080578063d14e62b81460a8575b600080fd5b348015606357600080fd5b50606a60d2565b6040518082815260200191505060405180910390f35b348015608b57600080fd5b50609260d8565b6040518082815260200191505060405180910390f35b34801560b357600080fd5b5060d06004803603810190808035906020019092919050505060e0565b005b60005481565b600043905090565b80600081905550505600a165627a7a7230582064856de85a2706463526593b08dd790054536042ef66d3204018e6790a2208d10029'
    )
}
{
    // caver.kct
    const kct = caver.kct
    {
        caver.kct.kip7.deploy(
            {
                name: 'Jasmine',
                symbol: 'JAS',
                decimals: 18,
                initialSupply: '100000000000000000000',
            },
            '0x{address in hex}'
        )
        const kip7 = new caver.kct.kip7()
        const clone = kip7.clone()
        const supportsInterface = kip7.supportsInterface('0x65787371')
        const name = kip7.name()
        const symbol = kip7.symbol()
        const decimals = kip7.decimals()
        const totalSupply = kip7.totalSupply()
        const balanceOf = kip7.balanceOf('0x{address in hex}')
        const allowance = kip7.allowance('0x{address in hex}', '0x{address in hex}')
        const isMinter = kip7.isMinter('0x{address in hex}')
        const isPauser = kip7.isPauser('0x{address in hex}')
        const paused = kip7.paused()
        const approve = kip7.approve('0x{address in hex}', 10, { from: '0x{address in hex}' })
        const transfer = kip7.transfer('0x{address in hex}', 10, { from: '0x{address in hex}' })
        const safeTransfer = kip7.safeTransfer('0x{address in hex}', 11, '0x1234', { from: '0x{address in hex}' })
        const transferFrom = kip7.transferFrom('0x{address in hex}', '0x{address in hex}', 10000, { from: '0x{address in hex}' })
        const safeTransferFrom = kip7.safeTransferFrom('0x{address in hex}', '0x{address in hex}', 11, '0x1234', {
            from: '0x{address in hex}',
        })
        const mint = kip7.mint('0x{address in hex}', 10000, { from: '0x{address in hex}' })
        const addMinter = kip7.addMinter('0x{address in hex}', { from: '0x{address in hex}' })
        const renounceMinter = kip7.renounceMinter()
        const burn = kip7.burn(1000, { from: '0x{address in hex}' })
        const burnFrom = kip7.burnFrom('0x{address in hex}', 1000, { from: '0x{address in hex}' })
        const addPauser = kip7.addPauser('0x{address in hex}', { from: '0x{address in hex}' })
        const renouncePauser = kip7.renouncePauser()
        const pause = kip7.pause()
        const unpause = kip7.unpause()
    }

    {
        caver.kct.kip17.deploy(
            {
                name: 'Jasmine',
                symbol: 'JAS',
            },
            '0x{address in hex}'
        )
        const kip17 = new caver.kct.kip17()
        const clone = kip17.clone()
        const supportsInterface = kip17.supportsInterface('0x80ac58cd')
        const name = kip17.name()
        const symbol = kip17.symbol()
        const totalSupply = kip17.totalSupply()
        const tokenURI = kip17.tokenURI(0)
        const tokenOfOwnerByIndex = kip17.tokenOfOwnerByIndex('0x{address in hex}', 5)
        const tokenByIndex = kip17.tokenByIndex(1)
        const balanceOf = kip17.balanceOf('0x{address in hex}')
        const ownerOf = kip17.ownerOf(8)
        const getApproved = kip17.getApproved(10)
        const isApprovedForAll = kip17.isApprovedForAll('0x{address in hex}', '0x{address in hex}')
        const isMinter = kip17.isMinter('0x{address in hex}')
        const paused = kip17.paused()
        const isPauser = kip17.isPauser('0x{address in hex}')
        const approve = kip17.approve('0x{address in hex}', 10, { from: '0x{address in hex}' })
        const setApprovalForAll = kip17.setApprovalForAll('0x{address in hex}', false, { from: '0x{address in hex}' })
        const transferFrom = kip17.transferFrom('0x{address in hex}', '0x{address in hex}', 2, { from: '0x{address in hex}' })
        const safeTransferFrom = kip17.safeTransferFrom('0x{address in hex}', '0x{address in hex}', 11, '0x1234', {
            from: '0x{address in hex}',
        })
        const addMinter = kip17.addMinter('0x{address in hex}', { from: '0x{address in hex}' })
        const renounceMinter = kip17.renounceMinter()
        const mintWithTokenURI = kip17.mintWithTokenURI('0x{address in hex}', 18, tokenURI, { from: '0x{address in hex}' })
        const burn = kip17.burn(14, { from: '0x{address in hex}' })
        const pause = kip17.pause()
        const unpause = kip17.unpause()
        const addPauser = kip17.addPauser('0x{address in hex}', { from: '0x{address in hex}' })
        const renouncePauser = kip17.renouncePauser()
    }
}

{
    // caver.utils
    const utils = caver.utils
    const randomHex = caver.utils.randomHex
    const _ = caver.utils._
    const toBN = caver.utils.toBN
    const isBN = caver.utils.isBN
    const isBigNumber = caver.utils.isBigNumber
    const sha3 = caver.utils.sha3
    const soliditySha3 = caver.utils.soliditySha3
    const isHex = caver.utils.isHex
    const isHexStrict = caver.utils.isHexStrict
    const isAddress = caver.utils.isAddress
    const toChecksumAddress = caver.utils.toChecksumAddress
    const checkAddressChecksum = caver.utils.checkAddressChecksum
    const toHex = caver.utils.toHex
    const hexToNumberString = caver.utils.hexToNumberString
    const hexToNumber = caver.utils.hexToNumber
    const numberToHex = caver.utils.numberToHex
    const hexToUtf8 = caver.utils.hexToUtf8
    const hexToAscii = caver.utils.hexToAscii
    const utf8ToHex = caver.utils.utf8ToHex
    const asciiToHex = caver.utils.asciiToHex
    const hexToBytes = caver.utils.hexToBytes
    const bytesToHex = caver.utils.bytesToHex
    const convertToPeb = caver.utils.convertToPeb
    const convertFromPeb = caver.utils.convertFromPeb
    const unitMap = caver.utils.unitMap
    const klayUnit = caver.utils.klayUnit
    const padLeft = caver.utils.padLeft
    const padRight = caver.utils.padRight
    const toTwosComplement = caver.utils.toTwosComplement
    const isContractDeployment = caver.utils.isContractDeployment
    const xyPointFromPublicKey = caver.utils.xyPointFromPublicKey
    const isHexPrefixed = caver.utils.isHexPrefixed
    const addHexPrefix = caver.utils.addHexPrefix
    const stripHexPrefix = caver.utils.stripHexPrefix
    const toBuffer = caver.utils.toBuffer
    const numberToBuffer = caver.utils.numberToBuffer
    const isValidHash = caver.utils.isValidHash
    const isValidHashStrict = caver.utils.isValidHashStrict
    const isTxHash = caver.utils.isTxHash
    const isTxHashStrict = caver.utils.isTxHashStrict
    const isValidPrivateKey = caver.utils.isValidPrivateKey
    const isValidPublicKey = caver.utils.isValidPublicKey
    const isValidRole = caver.utils.isValidRole
    const isEmptySig = caver.utils.isEmptySig
    const isKlaytnWalletKey = caver.utils.isKlaytnWalletKey
    const bufferToHex = caver.utils.bufferToHex
    const parseKlaytnWalletKey = caver.utils.parseKlaytnWalletKey
    const hashMessage = caver.utils.hashMessage
    const recover = caver.utils.recover
    const compressPublicKey = caver.utils.compressPublicKey
    const decompressPublicKey = caver.utils.decompressPublicKey
}

{
    // caver.ipfs
    const ipfs = caver.ipfs
    const setIPFSNode = caver.ipfs.setIPFSNode('localhost', 5001, false)
    const add = caver.ipfs.add('./test.txt')
    const get = caver.ipfs.get('Qmd9thymMS6mejhEDZfwXPowSDunzgma9ex4ezpCSRZGwC')
    const toHex = caver.ipfs.toHex('Qmd9thymMS6mejhEDZfwXPowSDunzgma9ex4ezpCSRZGwC')
    const fromHex = caver.ipfs.fromHex('0x1220dc1dbe0bcf1e5f6cce80bd3d7e7d873801c5a1732add889c0f25391d53470dc3')
}
