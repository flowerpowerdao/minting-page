<script lang="ts">
  import { onMount } from "svelte";
  import { store } from "../store";

  import Button from "./Button.svelte";
  import Loader from "./Loader.svelte";

  export let loading;
  export let toggleModal;

  onMount(async () => {
    const connected = await window.ic?.plug?.isConnected();
    if (connected) {
      console.log("plug connection detected");
      store.plugConnect();
    }
  });

  async function connect() {
    loading = "plug";
    await store.plugConnect();
    loading = "";
    toggleModal();
  }
</script>

<Button
  class="w-full lg:h-16 2xl:h-20 lg:rounded-[55px]"
  on:click={connect}
  disabled={loading}
>
  {#if loading === "plug"}
    <Loader></Loader>
  {:else}
    plug
  {/if}
</Button>
