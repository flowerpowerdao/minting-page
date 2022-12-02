# FPDAO Minting Page

## Setup
- install dfx version `0.12.0` (`DFX_VERSION=0.12.0 sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"`)
- install [Vessel](https://github.com/dfinity/vessel)
- install [Plug](https://plugwallet.ooo/)
- clone the repository and run `git submodule init` and `git submodule update`. this pulls the submodules the project depends on
- run `npm install` from root
- create a `set-deploy-env.zsh` file in the root directory according to the following example and replace the `WALLET_ADDRESS` with your Plug wallet address
```sh
export WALLET_ADDRESS="8b61ff722d7e6321eb99bb607ab0cf323b3c64b43d6a13c245c8a4e197f7b38b"
```

## Development
`npm run dev` will start local dev server, start dfx replica and deploy `ledger` and `icpflower-nft-canister`.

In Plug add a local network with following settings:

Network name = local

Host URL = http://127.0.0.1:4943

Ledger canister Id = ryjl3-tyaaa-aaaaa-aaaba-cai

Then switch to the local network

You can change local NFT sale settings in `icpflower-nft-canister/src/Env/lib.mo`