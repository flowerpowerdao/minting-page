<script lang="ts">
  import { collection } from "../collection";
  import type { SaleSettingsV3 } from "../declarations/ext/staging.did";
  import { store } from "../store";
  import { formatDistance } from "date-fns/formatDistance";
  import { onMount } from "svelte";
  import BuyNftButton from "./BuyNftButton.svelte";
  import { Principal } from '@dfinity/principal';

  let saleSettings: SaleSettingsV3;
  let saleStatus: "waiting" | "ongoing" | "ended" = "waiting";
  let startDateText = "-";
  let slotEndDateText = "-";
  let error = "";
  let tokens: Uint32Array | number[] = [];

  let fetchData = async () => {
    try {
      saleSettings = await $store.extActor.salesSettings($store.principal?.toText() || '');
      tokens = await store.getTokens();
    } catch (err) {
      console.error(err);
      error = "Sale didn't start yet.";
    }

    let startDate = new Date(Number(saleSettings.startTime / 1000000n));
    if (startDate.getTime() > Date.now() && saleSettings.remaining > 0) {
      saleStatus = "waiting";
    } else if (saleSettings.remaining > 0) {
      saleStatus = "ongoing";
    } else {
      saleStatus = "ended";
    }

    startDateText = formatDistance(startDate, new Date(), {
      addSuffix: true,
      includeSeconds: true,
    });

    if (saleSettings.endTime) {
      let endDate = new Date(Number(saleSettings.endTime / 1000000n));
      slotEndDateText = formatDistance(endDate.getTime(), new Date(), {
        addSuffix: true,
        includeSeconds: true,
      });
    }
  };

  function getSymbol(ledger: Principal) {
    if (ledger.toText() === 'ryjl3-tyaaa-aaaaa-aaaba-cai') {
      return "ICP";
    } else if (ledger.toText() === 'fua74-fyaaa-aaaan-qecrq-cai') {
      return "SEED";
    }
  }

  function getRemainingForLedger(ledger: Principal) {
    return saleSettings.remainingByLedger.find(([ldgr, _]) => ldgr.toText() === ledger.toText())?.[1] || 0n;
  }

  onMount(async () => {
    let timer = setInterval(fetchData, 3000);
    await fetchData();

    return () => {
      clearInterval(timer);
    };
  });
</script>

<svelte:head>
  <title>{collection.name} sale</title>
</svelte:head>

{#if saleSettings}
  <div class="flex flex-col grow">
    <img
      class="grow object-cover h-44 bg-gray-300 mb-12 rounded-xl max-w-6xl"
      src={"/banner.jpg"}
      alt="{collection.name} banner"
    />
    <img
      class="logo border-solid border-8 object-cover rounded border-[#f5f5f5] dark:border-black"
      src={"/logo.jpg"}
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
        {:else if saleSettings.endTime}
          <div class="text-xl font-semibold text-center mb-5">
            This pricing group closes {slotEndDateText}!
          </div>
        {/if}
        <div class="flex flex-wrap justify-center gap-20">
          {#each saleSettings.prices as priceInfo}
            <BuyNftButton
              count={1}
              price={priceInfo.price}
              symbol={getSymbol(priceInfo.ledger)}
              ledger={priceInfo.ledger}
              {saleStatus}
              disabled={getRemainingForLedger(priceInfo.ledger) == 0n}
            >
              {#if getRemainingForLedger(priceInfo.ledger) == 0n}
                <small>sold out</small>
              {/if}
            </BuyNftButton>
          {/each}
        </div>
      </div>
    {:else if saleStatus == "ended"}
      <div class="text-5xl">SOLD OUT</div>
    {/if}
  </div>

  {#if tokens.length}
    <div class="flex">
      You purchased: {tokens.length} NFT{#if tokens.length !== 1}s{/if}
    </div>
  {/if}
{:else if error}
  <div class="text-red-700 text-xl flex flex-col grow">
    <div>Something went wrong</div>
    <div>{error}</div>
  </div>
{:else}
  <div class="text-5xl m-auto pt-40">Loading...</div>
{/if}

<style>
  img {
    -webkit-user-drag: none;
  }

  .logo {
    position: relative;
    top: -100px;
    margin: 0 auto;
    border-radius: 50%;
    height: 120px;
    width: 120px;
  }
</style>
