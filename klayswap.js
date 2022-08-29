const Caver = require('./index')
const caver = new Caver('https://api.baobab.klaytn.net:8651')

// How to run klayswap.js
// - Replace `0x{private key}` to your private key string
// - Check the provider url (If you want to run script on the Cypress network, modify url above)
// - Run `node ./klayswap.js`

const factoryABI = [
    {
        name: 'createFee',
        type: 'function',
        payable: false,
        inputs: [],
        outputs: [
            {
                name: "",
                type: "uint256"
            }
        ],
    },
    {
        name: 'exchangeKlayNeg',
        type: 'function',
        payable: true,
        inputs: [
            { internalType: 'address', name: 'token', type: 'address' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
            { internalType: 'address[]', name: 'path', type: 'address[]' },
        ],
        outputs: [],
    },
    {
        name: 'createKlayPool',
        type: 'function',
        payable: true,
        inputs: [
            { internalType: 'address', name: 'token', type: 'address' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
            { internalType: 'uint256', name: 'fee', type: 'uint256' },
        ],
        outputs: [],
    },
    {
        name: 'createKctPool',
        type: 'function',
        payable: false,
        inputs: [
            { internalType: 'address', name: 'tokenA', type: 'address' },
            { internalType: 'uint256', name: 'amountA', type: 'uint256' },
            { internalType: 'address', name: 'tokenB', type: 'address' },
            { internalType: 'uint256', name: 'amountB', type: 'uint256' },
            { internalType: 'uint256', name: 'fee', type: 'uint256' },
        ],
        outputs: [],
    }, 
    {
        constant: true,
        inputs: [
            {
                name: '',
                type: 'address',
            },
            {
                name: '',
                type: 'address',
            },
        ],
        name: 'tokenToPool',
        outputs: [
            {
                name: '',
                type: 'address',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    }
]

createLP_KLAYKCT()
async function createLP_KLAYKCT() {
    const keyring = caver.wallet.add(caver.wallet.keyring.createFromPrivateKey('0x{private key}'))

    // Deploy KCT Token
    const jamieToken = await caver.kct.kip7.deploy(
        {
            name: 'Jamie',
            symbol: 'JAMIE',
            decimals: 18,
            initialSupply: '1000000000000000000000000000',
        },
        keyring.address
    )
    console.log(`New Token address: ${jamieToken.options.address}\n`)

    // Below address is in Baobab network
    // const klaySwapFactory = '0xC6a2Ad8cC6e4A7E08FC37cC5954be07d499E7654' // in Cypress
    const klaySwapFactory = '0xd2e72adcdd82e687158541fe196d53ed60caac09'
    const factory = caver.contract.create(factoryABI, klaySwapFactory)

    // Exchange specific KSP amount from KLAY
    const createLPFee = await factory.call({}, 'createFee')
    const swapToKSP = await factory.send({
        from: keyring.address, 
        gas: 1000000, 
        value: caver.utils.convertToPeb(10, 'KLAY') 
    }, 'exchangeKlayNeg', factory.options.address, caver.utils.toBN(createLPFee), [])
    console.log(`Exchange Klay to KSP Status =====> ${Boolean(swapToKSP.status)}`)

    // Create KLAY-KCT LP
    const initialFee = '30'
    const amount = '10000'
    // Before creating KLAY-KCT LP, approve token to KLAYswap protocol contract
    const approved = await jamieToken.approve(factory.options.address, amount, { from: keyring.address })
    console.log(`Approved KCT to Factory Contract(${factory.options.address}) Status: ${Boolean(approved.status)}\n`)

    const createdKlayPool = await factory.send({
        from: keyring.address, 
        gas: 5000000, 
        value: amount // 1:1 
    }, 'createKlayPool', jamieToken.options.address, amount, initialFee)
    console.log(`createKlayPool Status: ${Boolean(createdKlayPool.status)}`)

    const KLAY = '0x0000000000000000000000000000000000000000'
    const poolAddress = await factory.call({}, 'tokenToPool', KLAY, jamieToken.options.address)
    console.log(`Created KLAY-KCT pool address: ${poolAddress}`)
}