import localCanisterIds from "../power-equalizer/.dfx/local/canister_ids.json";

export let collection = {
  name: "Hello World",
  canisterId:
    process.env.NODE_ENV === "development"
      ? localCanisterIds.staging.local
      : "2oyfj-oyaaa-aaaae-qaeuq-cai",
  description: `The purpose of this mint is to stress test our new Canister code. We want to see how it behaves under (hopefully) heavy load and if any problems occur before we deploy the code to a real collection. We have been rewriting the code over the last few months after a code review and despite the fact that we have automated tests coded for most situations, we want to take this extra step to expose future collections to as little risk as possible. If you have a bot, please run it against our canister! Even though we originally planned to launch a SBT, it will now become a normal collection, because with a SBT some of the functionality like the transfer or the marketplace functionality cannot be tested. We haven't contacted any marketplaces, so it's uncertain if anyone will offer the collection for trading. Since Psychedelic has left the ecosystem and DAB is no longer maintained, I recommend using a wallet that allows collections to be added based on a canister ID, otherwise you might have a hard time transferring the NFT. 
    
  
  Please note that this canister could be bricked, use at your own risk! Happy minting :)`,
  // show nft asset preview immediately after purchase
  previewEnabled: true, // if true, NFT canister must have delayedReveal = false
};
