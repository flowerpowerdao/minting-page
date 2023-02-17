# FPDAO Minting Page

## Setup

- node `16.13.0` , npm `9.3.1`
-   install dfx version `0.12.1` (`DFX_VERSION=0.12.1 sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"`)
-   install [Vessel](https://github.com/dfinity/vessel)
-   install [Plug](https://plugwallet.ooo/)
-   clone the repository and run `git submodule init` and `git submodule update`. this pulls the submodules the project depends on
-   `cd power-equalizer` and run `vessel install` to install the depenedencies
-   run `npm install` from root
-   create a `set-deploy-env.zsh` file in the root directory according to the following example and replace the `WALLET_ADDRESS` with your Plug wallet address

```sh
export WALLET_ADDRESS="8b61ff722d7e6321eb99bb607ab0cf323b3c64b43d6a13c245c8a4e197f7b38b"
```

## Development

`npm start` will start local dev server, start dfx replica and deploy `ledger` and `power-equalizer`.

In Plug add a local network with following settings:

Network name = local

Host URL = http://127.0.0.1:4943

Ledger canister Id = ryjl3-tyaaa-aaaaa-aaaba-cai (check `.dfx/local/canister_ids.json`)

Then switch to the local network

You can change local NFT sale settings in `power-equalizer/src/Env/lib.mo`