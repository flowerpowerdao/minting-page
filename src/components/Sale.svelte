<script lang="ts">
  import { AuthStore } from 'fpdao-ui/auth-store';
  import CollectionInfo from "./CollectionInfo.svelte";

  export let authStore: AuthStore;
</script>

<div
  class="py-10 lg:py-0 lg:flex lg:items-center lg:pt-40 lg:pb-8 lg:justify-between lg:mx-[11%] lg:flex-col"
>
  <CollectionInfo {authStore} />
</div>
