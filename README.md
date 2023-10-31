# The Project
Scope of project :
1. NFT project that uses IPFS to store image
2. smart contract to mint 3 items with different rarity
3. users need to pay to mint NFT
4. only owner of the contract to withdraw from smart contract
5. only owner can transfer ownership of the contract to another address

# Getting Started
## Requirements

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  - You'll know you did it right if you can run `git --version` and you see a response like `git version x.x.x`
- [Nodejs](https://nodejs.org/en/)
  - You'll know you've installed nodejs right if you can run:
    - `node --version` and get an ouput like: `vx.x.x`
- [Yarn](https://yarnpkg.com/getting-started/install) instead of `npm`
  - You'll know you've installed yarn right if you can run:
    - `yarn --version` and get an output like: `x.x.x`
    - You might need to [install it with `npm`](https://classic.yarnpkg.com/lang/en/docs/install/) or `corepack`

## Quickstart
```
git clone https://github.com/syrieldev/NFT.git
cd NFT
yarn
```

# Usage on Local hardhat

Deploy:

```
yarn hardhat deploy
```

## Testing

```
yarn hardhat test
```

### Test Coverage

```
yarn hardhat coverage
```

# Deployment to a testnet or mainnet (Not yet tested)

1. Setup environment variables

You'll want to set your `SEPOLIA_RPC_URL`, `SEPOLIA_PRIVATE_KEY`,`SEPOLIA_SECOND_PRIVATE_KEY`  as environment variables. You can add them to a `.env` file, similar to what you see in `.env.example`.

- `PRIVATE_KEY`: The private key of your account (like from [metamask](https://metamask.io/)). **NOTE:** FOR DEVELOPMENT, PLEASE USE A KEY THAT DOESN'T HAVE ANY REAL FUNDS ASSOCIATED WITH IT.
  - You can [learn how to export it here](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key).
- `SEPOLIA_RPC_URL`: This is url of the seplia testnet node you're working with. You can get setup with one for free from [Alchemy](https://alchemy.com/?a=673c802981)

2. Get testnet ETH

Head over to [faucets.chain.link](https://faucets.chain.link/) and get some tesnet ETH. You should see the ETH show up in your metamask.
for the staging test, don't forget to add appropriate amount of testnet ETH to both of your wallets.

3. Deploy

```
yarn hardhat deploy --network sepolia
```

## Verify on etherscan (Not yet tested)

If you deploy to a testnet or mainnet, you can verify it if you get an [API Key](https://etherscan.io/myapikey) from Etherscan and set it as an environemnt variable named `ETHERSCAN_API_KEY`. You can pop it into your `.env` file as seen in the `.env.example`.

In it's current state, if you have your api key set, it will auto verify sepolia contracts!

However, you can manual verify with:

```
yarn hardhat verify --constructor-args arguments.js DEPLOYED_CONTRACT_ADDRESS
```

# Linting

`solhint` installation: [Documentation](https://protofire.github.io/solhint/#installation)

To check linting / code formatting:
```
yarn lint
```
or, to fix: 
```
yarn lint:fix
```

# Formatting 

```
yarn format
```


# Thank you!

# Side Note
my workflow :
setup hardhat configurations file
- analyse existing code and variable imports from hardhat environment
- setup chainlink subscription
- hardhat config
- hardhat helper

analyse existing code
- error revert compare with fundme // skipped
- deploy args?

IPFS setup (image and ERC721 JSON metadata schema)
options :
1. our own IPFS node
2. Pinata, Pinning IPFS service
3. NFTS Storage, (filecoin & IPFS service). Decentralized

Contract
- VRF Coordinator to interact with chainlink oracle
- ERC 721 compliant
- Chance array & enum type which uses chainlink randomness to make rarity
- Configure TokenURI with setTokenURI extension of ERC721
- set NFT Mint Price
- set withdraw function
- transfer Ownership function
- view functions to check state
- event setup of nftrequest
- event nft minted


deploy
- basic deploy & namedAccount getter
- VRF coordinator & subs ID, fund amount
- args?
- IPFS deployment (image folder locally) to Pinata, IPFS pinning as a service
- Pinata env accounts
- readable stream?
- deploy image to pinata
- deploy metadata to pinata
- deploy contract (not yet) 
- verify (not yet)


Test
- mint
- emit event
- ownership & withdrawal