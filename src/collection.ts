import localCanisterIds from "../power-equalizer/.dfx/local/canister_ids.json";

console.log(process.env.NODE_ENV);

export let collection = {
  name: "Grapes of Wrath",
  canisterId:
    process.env.NODE_ENV === "development"
      ? localCanisterIds.staging.local
      : "pzd64-5yaaa-aaaap-ahljq-cai",
  description: "“Man, unlike any other thing organic or inorganic in the universe, grows beyond his work, walks up the stairs of his concepts, and emerges ahead of his accomplishments.”\n ― John Steinbeck, The Grapes of Wrath",
  // show nft asset preview immediately after purchase
  previewEnabled: false, // if true, NFT canister must have revealDelay = 0
};
