import localCanisterIds from "../power-equalizer/.dfx/local/canister_ids.json";

export let collection = {
  name: "Cherries",
  canisterId:
    process.env.NODE_ENV === "development"
      ? localCanisterIds.staging.local
      : "y2ga5-lyaaa-aaaae-qae2q-cai",
  description:
    "An evolution of artist Ludo's decade-long exploration of the vanitas style. Originating from an original 2010 work in Williamsburg, Brooklyn, the collection finds its distinct aesthetic in the fusion of cherry pairs based on human skulls, embodying the eternal duality of existence. The digital manifestations of these intricate pieces are joined with FP DAO as its 3rd collaboration, bringing the largest and most diverse trait variety of its kind. They exist as an ensemble of 6,666—the symbolic fruits that perpetuate the legacy of artistic discourse in the cryptosphere.",
  // show nft asset preview immediately after purchase
  previewEnabled: false, // if true, NFT canister must have revealDelay = 0
};
