import localIcpFlower from '../icpflower-nft-canister/.dfx/local/canister_ids.json';

export let canisterId = process.env.NODE_ENV === 'development' ? localIcpFlower.staging.local : '4ggk4-mqaaa-aaaae-qad6q-cai';