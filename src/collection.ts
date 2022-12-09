import localIcpFlower from "../icpflower-nft-canister/.dfx/local/canister_ids.json";

export let collection = {
    name: "ICP Flower",
    canisterId:
        process.env.NODE_ENV === "development"
            ? localIcpFlower.staging.local
            : "4ggk4-mqaaa-aaaae-qad6q-cai",
    description:
        "The final part of the Flower Power DAO Trilogy, the continuation of Ludo’s physical to digital initiative, and the dawn of a community-curated art hub. This collection finalizes the historic arc of Ludo’s visionary story for blockchain—one that began with the 2018 “R.I.P Banking System” BTC Flower and closes with the now “R.I.P Big Tech” ICP Flower. Both are symbols of our shared dream for the future created to inspire hope during times of peak uncertainty. While it marks the end of an era, it only completes the first step of our story as we now shift toward making new art the vessel through which these stories can reach a critical mass, and make real the dream our flowers represent. What comes next is third-party art, curated by this community, grown from flower seeds, incentivized by FP DAO, and provided for by the finest artists, through which flower holders, of course, remain the exclusive access members.",
    banner: "https://s3.amazonaws.com/pf-user-files-01/u-166728/uploads/2022-10-25/6u23w8i/collectionbanner_comp1.jpg",
    logo: "https://s3.amazonaws.com/pf-user-files-01/u-166728/uploads/2022-10-25/d113wr4/avatar_comp1.jpg",
};
