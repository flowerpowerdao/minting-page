# FPDAO Minting Page

## Setup
- install dfx version `0.12.0` (`DFX_VERSION=0.12.0 sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"`)
- install [Vessel](https://github.com/dfinity/vessel)
- install [Plug](https://plugwallet.ooo/)
- clone the repository and run `git submodule init` and `git submodule update`. this pulls the submodules the project depends on
- run `npm install` from root

## Development
`npm run dev` will start local dev server, start dfx replica and deploy `icpflower-nft-canister`.


You can change local NFT sale settings in `icpflower-nft-canister/src/Env/lib.mo`