<script lang="ts">
  import { createActor } from "../declarations/ext/index.js";
  import { onMount } from "svelte";
  import formatDistance from "date-fns/formatDistance";
  import type { SaleSettings } from "../declarations/ext/staging.did";
  import { canisterId } from "../collection";
  import { store } from "../store";
  import Button from "../components/Button.svelte";
  import Login from "../components/Login.svelte";
  import BuyNftModal from "./BuyNftModal.svelte";
  import LoginModal from "../components/LoginModal.svelte";
  import { get } from "svelte/store";

  let collectionName = 'ICP Flower';
  let description = 'The final part of the Flower Power DAO Trilogy, the continuation of Ludo’s physical to digital initiative, and the dawn of a community-curated art hub. This collection finalizes the historic arc of Ludo’s visionary story for blockchain—one that began with the 2018 “R.I.P Banking System” BTC Flower and closes with the now “R.I.P Big Tech” ICP Flower. Both are symbols of our shared dream for the future created to inspire hope during times of peak uncertainty. While it marks the end of an era, it only completes the first step of our story as we now shift toward making new art the vessel through which these stories can reach a critical mass, and make real the dream our flowers represent. What comes next is third-party art, curated by this community, grown from flower seeds, incentivized by FP DAO, and provided for by the finest artists, through which flower holders, of course, remain the exclusive access members.';
  let banner = 'https://s3.amazonaws.com/pf-user-files-01/u-166728/uploads/2022-10-25/6u23w8i/collectionbanner_comp1.jpg';
  let logo = 'https://s3.amazonaws.com/pf-user-files-01/u-166728/uploads/2022-10-25/d113wr4/avatar_comp1.jpg';

  let saleSettings: SaleSettings;
  let saleStatus: 'waiting' | 'ongoing' | 'ended' = 'waiting';
  let startDateText = '-';
  let error = '';

  let loginModalOpen = false;
  let buyNftModalOpen = false;
  let buying = {
    count: 0,
    totalPrice: 0,
  };

  async function buy(count, totalPrice) {
    let isAuthed = await store.isConnected();
    if (!isAuthed) {
      loginModalOpen = true;
      return;
    }
    buying = { count, totalPrice };
    buyNftModalOpen = true;
  }

  let fetchData = async () => {
    let state = get(store);
    let accountAddress = '8b61ff722d7e6321eb99bb607ab0cf323b3c64b43d6a13c245c8a4e197f7b38b';
    console.log(state.extActor)
    saleSettings = await state.extActor.salesSettings(accountAddress);
    console.log(saleSettings);

    let startDate = new Date(Number(saleSettings.startTime / 1000000n));

    if (startDate.getTime() > Date.now()) {
      saleStatus = 'waiting';
    }
    else if (saleSettings.remaining) {
      saleStatus = 'ongoing';
    }
    else {
      saleStatus = 'ended';
    }

    startDateText = formatDistance(startDate, new Date, { addSuffix: true });
  };

  onMount(() => {
    fetchData().catch((err) => {
      error = err;
      console.error(err);
    });
  });
</script>

<svelte:head>
  <title>{collectionName} sale</title>
</svelte:head>

<BuyNftModal count={buying.count} totalPrice={buying.totalPrice} bind:open={buyNftModalOpen}></BuyNftModal>
<!-- <LoginModal bind:open={loginModalOpen}></LoginModal> -->

<div class="flex flex-col pt-10 min-w-0">
  <Login></Login>
  {#if saleSettings}
    <div class="flex flex-col grow">
      <img class="grow object-cover h-44 bg-gray-300 mb-12 rounded-xl max-w-6xl" src="{banner}" alt="{collectionName} banner">
      <img class="logo object-cover" src="{logo}" alt="{collectionName} logo">
    </div>

    <div class="flex flex-col justify-center gap-12 text-center max-w-6xl mb-40 dark:text-white">
      <div class="text-4xl font-semibold">{collectionName}</div>
      <div>{description}</div>

      <div class="flex flex-wrap justify-center mt-10 gap-7">
          {#if saleStatus == 'waiting'}
            <div class="flex flex-col px-16">
              <div>START DATE</div>
              <div class="text-2xl font-bold">{startDateText}</div>
            </div>
          {:else if saleStatus == 'ended'}
            <div class="flex flex-col px-16">
              <div>END DATE</div>
              <div class="text-2xl font-bold">sale ended</div>
            </div>
          {/if}
        <div class="flex flex-col px-16">
          <div>AVAILABLE</div>
          <div class="text-2xl font-bold">{saleSettings.remaining ?? '-'}</div>
        </div>
        <div class="flex flex-col px-16">
          <div>SOLD</div>
          <div class="text-2xl font-bold">{saleSettings.sold ?? '-'}</div>
        </div>
      </div>
      
      <div class="w-5/6 self-center bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden">
        <div class="h-8 bg-gray-800 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full dark:bg-gray-200" style="width: {Number(saleSettings.remaining) / Number(saleSettings.totalToSell) * 100}%"></div>
      </div>

      {#if saleSettings.remaining > 0n && (saleStatus == 'waiting' || saleStatus == 'ongoing')}
        <div class="mt-12">
          {#if saleStatus == 'waiting'}
            <div class="text-xl font-semibold text-center mb-5">This pricing group opens {startDateText}!</div>
          {/if}
          <div class="flex flex-wrap justify-center gap-20">
            {#each saleSettings.bulkPricing as [count, price]}
              <Button disabled={saleStatus == 'waiting'} on:click={() => buy(count, Number(price) / 100000000)}>BUY {count} NFTS<br>FOR {(Number(price) / 100000000).toFixed(2)} ICP</Button>
            {/each}
          </div>
        </div>
      {:else if saleStatus == 'ended'}
        <div class="text-5xl">SALE ENDED</div>
      {:else}
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

<style>
  img {
    -webkit-user-drag: none;
  }
  
  .logo {
    position: relative;
    top: -100px;
    margin: 0 auto;
    border: 10px solid white;
    border-radius: 50%;
    height: 120px;
    width: 120px;
  }
</style>