<script lang="ts">
  import Button from "../components/Button.svelte";
  import Modal from "../components/Modal.svelte";

  export let open;
  export let count: number;
  export let totalPrice: number;

  let loading = "";
</script>

<Modal title="Buy NFT" bind:open={open}>
  <div class="flex flex-col gap-5">
    <div class="text-xl text-left px-6 py-12">
      Are you sure you want to continue with this purchase of <b>{count}</b> NFT{count === 1 ? '' : 's'} for the total price of <b>{totalPrice}</b> ICP?
      All transactions are final on confirmation and can't be reversed.
    </div>
    <div class="flex gap-3 justify-end">
      <Button>BUY</Button>
      <Button>Cancel</Button>
    </div>
  </div>
</Modal>