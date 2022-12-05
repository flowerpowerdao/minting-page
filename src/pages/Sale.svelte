<script lang="ts">
    import { onMount } from "svelte";
    import formatDistance from "date-fns/formatDistance";
    import type { SaleSettings } from "../declarations/ext/staging.did";
    import { store } from "../store";
    import Button from "../components/Button.svelte";
    import BuyNftModal from "../components/BuyNftModal.svelte";
    import Loader from "../components/Loader.svelte";
    import { collection } from "../collection";

    let saleSettings: SaleSettings;
    let saleStatus: "waiting" | "ongoing" | "ended" = "waiting";
    let startDateText = "-";
    let error = "";

    let loginModalOpen = false;
    let buyNftModalOpen = false;
    let buyButtonLoading = false;
    let buying = {
        count: 0n,
        totalPrice: 0n,
    };

    async function buy(count, totalPrice) {
        buyButtonLoading = true;
        buyButtonLoading = false;
        buying = { count, totalPrice };
        buyNftModalOpen = true;
    }

    let fetchData = async () => {
        saleSettings = await $store.extActor.salesSettings($store.accountId);

        let startDate = new Date(Number(saleSettings.startTime / 1000000n));

        if (startDate.getTime() > Date.now()) {
            saleStatus = "waiting";
        } else if (saleSettings.remaining) {
            saleStatus = "ongoing";
        } else {
            saleStatus = "ended";
        }

        startDateText = formatDistance(startDate, new Date(), {
            addSuffix: true,
        });
    };

    onMount(async () => {
        let timer = setInterval(fetchData, 10000);
        await fetchData();

        return () => {
            clearInterval(timer);
        };
    });
</script>

<svelte:head>
    <title>{collection.name} sale</title>
</svelte:head>

<!-- <BuyNftModal
    bind:open={buyNftModalOpen}
    count={buying.count}
    totalPrice={buying.totalPrice}
    on:success={fetchData}
/> -->
<!-- <LoginModal bind:open={loginModalOpen} /> -->

<div class="flex flex-col pt-10 min-w-0">
    {#if saleSettings}
        <div class="flex flex-col grow">
            hi
            <img
                class="grow object-cover h-44 bg-gray-300 mb-12 rounded-xl max-w-6xl"
                src={collection.banner}
                alt="{collection.name} banner"
            />
            <img
                class="logo object-cover"
                src={collection.logo}
                alt="{collection.name} logo"
            />
        </div>

        <div
            class="flex flex-col justify-center gap-12 text-center max-w-6xl mb-40 dark:text-white"
        >
            <div class="text-4xl font-semibold">{collection.name}</div>
            <div>{collection.description}</div>

            <div class="flex flex-wrap justify-center mt-10 gap-7">
                {#if saleStatus == "waiting"}
                    <div class="flex flex-col px-16">
                        <div>START DATE</div>
                        <div class="text-2xl font-bold">{startDateText}</div>
                    </div>
                {:else if saleStatus == "ended"}
                    <div class="flex flex-col px-16">
                        <div>END DATE</div>
                        <div class="text-2xl font-bold">sale ended</div>
                    </div>
                {/if}
                <div class="flex flex-col px-16">
                    <div>AVAILABLE</div>
                    <div class="text-2xl font-bold">
                        {saleSettings.remaining ?? "-"}
                    </div>
                </div>
                <div class="flex flex-col px-16">
                    <div>SOLD</div>
                    <div class="text-2xl font-bold">
                        {saleSettings.sold ?? "-"}
                    </div>
                </div>
            </div>

            <div
                class="w-5/6 self-center bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden"
            >
                <div
                    class="h-8 bg-gray-800 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full dark:bg-gray-200"
                    style="width: {(Number(saleSettings.remaining) /
                        Number(saleSettings.totalToSell)) *
                        100}%"
                />
            </div>

            {#if saleSettings.remaining > 0n && (saleStatus == "waiting" || saleStatus == "ongoing")}
                <div class="mt-12">
                    {#if saleStatus == "waiting"}
                        <div class="text-xl font-semibold text-center mb-5">
                            This pricing group opens {startDateText}!
                        </div>
                    {/if}
                    <div class="flex flex-wrap justify-center gap-20">
                        {#each saleSettings.bulkPricing as [count, price]}
                            <Button
                                disabled={saleStatus == "waiting"}
                                on:click={() => buy(count, price)}
                            >
                                {#if buyButtonLoading}
                                    <Loader class="h-14" />
                                {:else}
                                    BUY {count} NFT<br />FOR {(
                                        Number(price) / 100000000
                                    ).toFixed(2)} ICP
                                {/if}
                            </Button>
                        {/each}
                    </div>
                </div>
            {:else if saleStatus == "ended"}
                <div class="text-5xl">SOLD OUT</div>
            {/if}
        </div>
    {:else if error}
        <details class="text-red-700 text-xl cursor-pointer">
            <summary>Something went wrong</summary>
            <div>{error}</div>
        </details>
    {:else}
        <div class="text-5xl m-auto pt-40">Loading...</div>
    {/if}
</div>
