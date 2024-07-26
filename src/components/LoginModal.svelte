<script lang="ts">
  import Modal from "./Modal.svelte";
  import PlugButton from "./PlugButton.svelte";
  import StoicButton from "./StoicButton.svelte";
  import BitfinityButton from "./BitfinityButton.svelte";

  export let toggleModal;

  let loading = ""; // this allows us to disable both buttons if one of them is clicked
</script>

<Modal title={"login with …"} {toggleModal}>
  <div class="flex gap-3 flex-col flex-1 justify-center items-center">
    <PlugButton bind:loading {toggleModal} />
    {#if location.hostname === 'mint.fpdao.app'}
      <p class="text-sm text-gray-600 mb-2">To login with Plug please use the canister url: <a class="underline" href="https://3rqw6-naaaa-aaaae-qaeqa-cai.icp0.io/">https://3rqw6-naaaa-aaaae-qaeqa-cai.icp0.io/</a></p>
    {/if}
    <StoicButton bind:loading {toggleModal} />
    <BitfinityButton bind:loading {toggleModal} />
  </div>
  <div class="flex mt-10 justify-end">
    <a class="underline decoration-dotted" href="https://x.com/StoicWalletApp/status/1706317772194517482" target="_blank" rel="noopener noreferrer">Problems connecting with Stoic?</a>
  </div>
</Modal>
