import localCanisterIds from "../power-equalizer/.dfx/local/canister_ids.json";

console.log(process.env.NODE_ENV);

export let collection = {
  name: "Clown Skateboards V2.0",
  canisterId:
    process.env.NODE_ENV === "development"
      ? localCanisterIds.staging.local
      : "hcsnx-2iaaa-aaaam-ac4bq-cai",
      // : "ubcso-fqaaa-aaaan-qlrca-cai", // staging
  description: "The iconic Clown logo returns, now in a more digital form with a pixelated format. The colors, chosen by the FLOWER POWER COMMUNITY, have been remixed, reworked, and energized with the creative eye of LUDO. A special Clown camo has been produced to add further flair to this release, and 4 of our OG colors will be used, giving this release vibrancy and rarity.",
  // show nft asset preview immediately after purchase
  previewEnabled: false, // if true, NFT canister must have revealDelay = 0
};
