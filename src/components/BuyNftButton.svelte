<script lang="ts">
  import Button from "./Button.svelte";
  import Loader from "./Loader.svelte";
  import { store } from "../store";
  import LoginModal from "./LoginModal.svelte";
  import BuyNftModal from "./BuyNftModal.svelte";
  import { Principal } from '@dfinity/principal';

  export let count, price, saleStatus, disabled = false;
  export let symbol;
  export let ledger: Principal;

  let openLoginModal = false;
  let openBuyModal = false;

  function toggleLoginModal() {
    openLoginModal = !openLoginModal;
  }

  function toggleBuyModal() {
    openBuyModal = !openBuyModal;
  }
</script>

<div>
  <Button
    style={"max-w-[150px] lg:h-16 2xl:h-20"}
    disabled={saleStatus === "waiting" || disabled}
    on:click={$store.isAuthed ? toggleBuyModal : toggleLoginModal}
  >
    {#if $store.isBuying}
      <Loader class="h-14" />
    {:else}
      BUY {count} NFT<br />FOR {(Number(price) / 100000000).toFixed(3)} {symbol}
    {/if}
  </Button>
  <slot></slot>
</div>

{#if openBuyModal}
  <BuyNftModal {toggleBuyModal} {count} {price} {symbol} {ledger} />
{/if}
{#if openLoginModal}
  <LoginModal toggleModal={toggleLoginModal} />
{/if}
