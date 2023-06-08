import localCanisterIds from "../power-equalizer/.dfx/local/canister_ids.json";

export let collection = {
  name: "Cherry",
  canisterId:
    process.env.NODE_ENV === "development"
      ? localCanisterIds.staging.local
      : "2v5zm-uaaaa-aaaae-qaewa-cai",
  description:
    "In a stunning display of artistic expression, the renowned creator Ludo has taken the reins of Clown Skateboards' infamous logo, which was first crafted by the illustrious Banksy. With four mesmerizing refixes, Ludo deftly employs a palette of colors drawn from our collective memory of the most unforgettable figures and events of the past two decades, imbuing this latest release with a distinctive character and elevating Clown Skateboards into the upper echelon of the Internet Computer.",
  // show nft asset preview immediately after purchase
  previewEnabled: false, // if true, NFT canister must have revealDelay = 0
};
