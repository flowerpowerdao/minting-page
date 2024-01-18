import localCanisterIds from "../power-equalizer/.dfx/local/canister_ids.json";

export let collection = {
  name: "BTC Flower Gen 2.0",
  canisterId:
    process.env.NODE_ENV === "development"
      ? localCanisterIds.staging.local
      : "u2kyg-aaaaa-aaaag-qc5ja-cai",
  description: "In early 2018, BTC Flower (‘RIP Banking System’) made its physical debut on the streets of Paris then around the world. 2021, a virtual collection of 2009 Flowers bloomed for the first time in the cryptosphere. Using digital format at its best, the randomly generated artwork evolves following the Bitcoin price. BTC Flower Gen 2.0 celebrates, in a pure pixel format, the 2nd year anniversary of the digital plant as well as new ambitions to reach Flower Power vision.",
  // show nft asset preview immediately after purchase
  previewEnabled: false, // if true, NFT canister must have revealDelay = 0
};
