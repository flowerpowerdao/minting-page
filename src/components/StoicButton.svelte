<script>
  import { onMount } from "svelte";
  import { StoicIdentity } from "ic-stoic-identity";
  import { store } from "../store";

  import Button from "./Button.svelte";
  import Loader from "./Loader.svelte";

  export let loading;
  export let toggleModal;

  onMount(async () => {
    StoicIdentity.load().then(async (identity) => {
      if (identity !== false) {
        // ID is a already connected wallet!
        store.stoicConnect();
      }
    });
  });

  async function connect() {
    loading = "stoic";
    await store.stoicConnect();
    loading = "";
    toggleModal();
  }
</script>

<Button
  class="w-full lg:h-16 2xl:h-20 lg:rounded-[55px]"
  on:click={connect}
  disabled={loading}
>
  {#if loading === "stoic"}
    <Loader></Loader>
  {:else}
    stoic
  {/if}
</Button>
