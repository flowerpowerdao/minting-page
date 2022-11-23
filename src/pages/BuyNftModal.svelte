<script lang="ts">
  import Button from "../components/Button.svelte";
  import Modal from "../components/Modal.svelte";
  import { store } from "../store";
  import { get } from "svelte/store";

  export let open;
  export let count: number;
  export let totalPrice: number;

  let buying = false;
  let canClose = false;
  let progressText = '';

  $: {
    if (!open) {
      reset();
    }
  };

  const _getRandomBytes = () => {
    var bs = [];
    for (var i = 0; i < 32; i++) {
      bs.push(Math.floor(Math.random() * 256));
    }
    return bs;
  };

  function reset() {
    buying = false;
    canClose = false;
    progressText = '';
  }

  async function close() {
    open = false;
  }

  async function buy() {
    let state = get(store);
    buying = true;
    progressText = 'Reserving NFT...';

    try {
      console.log(1)
      let accountId = window.ic.plug.sessionManager.sessionData.accountId;
      let res = await state.extActor.reserve(500000000n, 1n, accountId, _getRandomBytes());
      console.log(2, res)

      if ('err' in res) {
        throw res.err;
      }

      var payToAddress = res.ok[0];
      var priceToPay = res.ok[1];

      if (state.isAuthed === 'plug') {
        let hight = await window.ic.plug.requestTransfer({
          to: payToAddress,
          amount: Number(priceToPay),
        });
        console.log('sent', hight)
      }

      progressText = 'Transferring ICP...';
    } catch (err) {
      progressText = 'ERROR: ' + err;
      canClose = true;
      throw err;
    }
  }
</script>

<Modal title="Buy NFT" bind:open={open}>
  {#if !buying}
    <div class="flex flex-col gap-5">
      <div class="text-xl text-left px-6 py-12">
        Are you sure you want to continue with this purchase of <b>{count}</b> NFT{count === 1 ? '' : 's'} for the total price of <b>{totalPrice}</b> ICP?
        All transactions are final on confirmation and can't be reversed.
      </div>
      <div class="flex gap-3 justify-end">
        <Button on:click={buy}>BUY</Button>
        <Button on:click={close}>Cancel</Button>
      </div>
    </div>
  {:else}
    <div class="flex justify-center">{progressText}</div>
  {/if}

  {#if canClose}
    <div class="flex gap-3 justify-end">
      <Button on:click={close}>Cancel</Button>
    </div>
  {/if}
</Modal>