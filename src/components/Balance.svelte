<script lang="ts">
  import { store } from "../store";
  import spinner from "../assets/loading.gif";
</script>

<div
  class="flex items-start justify-center font-mono italic -ml-0.5 -mt-0.5 text-xl bg-white dark:bg-black border-black dark:border-white dark:text-white border-2  py-1 "
>
  <div class="">balance:&nbsp;</div>
  {#if $store.isLoading}
    <img class="h-6" src={spinner} alt="loading animation" />
  {:else}
    {$store.balance.toFixed(2)} ICP
    <br>
    {$store.seedBalance.toFixed(2)} SEED
  {/if}
</div>
