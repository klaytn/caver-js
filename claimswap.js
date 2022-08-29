const Caver = require('./index')

const caver = new Caver('https://api.baobab.klaytn.net:8651')

// How to run claimswap.js
// - Replace `0x{private key}` to your private key string
// - Check the provider url (If you want to run script on the Cypress network, modify url above)
// - Run `node ./claimswap.js`

const claimSwapFactoryABI = [
    {
        constant: true,
        inputs: [{ name: '', type: 'address' }, { name: '', type: 'address' }],
        name: 'getPair',
        outputs: [{ name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
]
const claimSwapRouterABI = [
    {
        constant: false,
        inputs: [
            { name: 'token', type: 'address' },
            { name: 'amountTokenDesired', type: 'uint256' },
            { name: 'amountTokenMin', type: 'uint256' },
            { name: 'amountKLAYMin', type: 'uint256' },
            { name: 'to', type: 'address' },
            { name: 'deadline', type: 'uint256' },
        ],
        name: 'addLiquidityKLAY',
        outputs: [
            { name: 'amountToken', type: 'uint256' },
            { name: 'amountKLAY', type: 'uint256' },
            { name: 'liquidity', type: 'uint256' },
        ],
        payable: true,
        stateMutability: 'payable',
        type: 'function',
    },
]

createLiquidityPoolKLAYKCT()
async function createLiquidityPoolKLAYKCT() {
    const keyring = caver.wallet.add(caver.wallet.keyring.createFromPrivateKey('0x{private key}'))

    // Deploy KCT Token
    const jamieToken = await caver.kct.kip7.deploy(
        {
            name: 'JamieToken',
            symbol: 'JMET',
            decimals: 18,
            initialSupply: '1000000000000000000000000000',
        },
        keyring.address
    )
    console.log(`KCT Token(Jamie Token) address: ${jamieToken.options.address}\n`)

    // Below addresses are in Baobab network
    // const routerAddress = '0xEf71750C100f7918d6Ded239Ff1CF09E81dEA92D' // in Cypress
    // const factoryAddress = '0x3679c3766E70133Ee4A7eb76031E49d3d1f2B50c' // in Cypress
    // const wKLAYAddress = '0xe4f05A66Ec68B54A58B17c22107b02e0232cC817' // in Cypress
    const routerAddress = '0xB1C4C22FeE13DA89E8D983227d9dc6314E29894a'
    const factoryAddress = '0x79841BFF57F826aB6F1AE8dBC68a564375AA878F'
    const wKLAYAddress = '0x60Cd78c3edE4d891455ceAeCfA97EECD819209cF'

    // Add liquidity and mint LP tokens
    const router = caver.contract.create(claimSwapRouterABI, routerAddress)
    const desiredTokenAmount = caver.utils.convertToPeb(1, 'KLAY')
    const desiredKLAYAmount = caver.utils.convertToPeb(1, 'KLAY')
    // Before adding liquidity KLAY-KCT, approve token to ClaimSwap Router contract
    const approved = await jamieToken.approve(router.options.address, desiredTokenAmount, { from: keyring.address })
    console.log(`Approved KCT to Router Contract(${router.options.addresss}) Status: ${Boolean(approved.status)}`)
    const sendOptions = { from: keyring.address, gas: 10000000, value: desiredKLAYAmount }
    const addedLiquidityKLAY = await router.send(
        sendOptions,
        'addLiquidityKLAY',
        jamieToken.options.address,
        desiredTokenAmount,
        1, // amountTokenMin: Must be <= desiredTokenAmount
        1, // amountKLAYMin: Must be <= desiredKLAYAmount
        keyring.address, // to: Recipient of the liquidity tokens.
        Date.now() + 5000 // deadline: Unix timestamp after which the transaction will revert.
    )
    console.log(`Added Liquidity KLAY Status: ${Boolean(addedLiquidityKLAY.status)}`)

    // Get a WKLAY-KCT pair
    const factory = caver.contract.create(claimSwapFactoryABI, factoryAddress)
    const pairAddress = await factory.call({}, 'getPair', wKLAYAddress, jamieToken.options.address)
    const pairContract = caver.kct.kip7.create(pairAddress)
    const totalSupply = caver.utils.convertFromPeb(await pairContract.totalSupply(), 'KLAY')
    console.log(`WKLAY(${wKLAYAddress})-KCT(${jamieToken.options.address}) Pair Total Supply: ${totalSupply}`)
}
