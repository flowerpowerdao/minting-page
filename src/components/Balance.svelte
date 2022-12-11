<script lang="ts">
  import { store } from "../store";
  import spinner from "../assets/loading.gif";
</script>

<div
  class="flex items-center justify-center font-mono italic -ml-0.5 -mt-0.5 text-xl bg-white dark:bg-black border-black dark:border-white dark:text-white border-2  py-1 "
>
  <div class="">balance: </div>
  {#if $store.isLoading}
    <img class="h-6" src={spinner} alt="loading animation" />
  {:else}
    {$store.balance} ICP
  {/if}
</div>
