<script lang="ts">
  import Button from "../components/Button.svelte";
  import Modal from "../components/Modal.svelte";
  import { store } from "../store";
  import { get } from "svelte/store";
  import { createEventDispatcher } from 'svelte';
  import Loader from "../components/Loader.svelte";

  export let open;
  export let count: bigint;
  export let totalPrice: bigint;

  let step: 'confirm' | 'buying' | 'bought' | 'error' = 'confirm';
  let progressText = '';
  let errorText = '';
  let dispatch = createEventDispatcher();

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
    step = 'confirm';
    progressText = '';
    errorText = '';
  }

  async function close() {
    open = false;
  }

  async function buy() {
    let state = get(store);
    step = 'buying';
    progressText = 'Reserving NFT...';

    try {
      // reserve
      let accountId = state.accountId;
      console.log('reserving for account', accountId);
      let res = await state.extActor.reserve(totalPrice, count, accountId, _getRandomBytes());

      if ('err' in res) {
        throw res.err;
      }

      var payToAddress = res.ok[0];
      var priceToPay = res.ok[1];

      // transfer ICP
      progressText = 'Transferring ICP...';
      await store.transfer(payToAddress, priceToPay);

      // retreive
      progressText = 'Completing purchase...';

      while (true) {
        let res;
        try {
          res = await state.extActor.retreive(payToAddress);
        } catch (e) {
          continue;
        }
        if ('ok' in res) break;
        if ('err' in res)
          throw 'Your purchase failed! If ICP was sent and the sale ran out, you will be refunded shortly!';
      }
      
      step = 'bought';

      dispatch('success');
    } catch (err) {
      step = 'error';
      errorText = err;
      throw err;
    }
  }
</script>

<Modal title="Buy NFT" bind:open={open}>
  {#if step == 'confirm'}
    <div class="flex flex-col gap-5">
      <div class="text-xl text-left px-6 py-12 my-6">
        Are you sure you want to continue with this purchase of <b>{count}</b> NFT{count === 1n ? '' : 's'} for the total price of <b>{totalPrice / 100000000n}</b> ICP?
        All transactions are final on confirmation and can't be reversed.
      </div>
      <div class="flex gap-3 justify-end">
        <Button on:click={buy}>BUY</Button>
        <Button on:click={close}>Cancel</Button>
      </div>
    </div>
  {:else if step == 'buying'}
    <div class="flex items-center justify-center gap-5 my-20">
      <Loader></Loader>
      <div class="text-3xl">{progressText}</div>
    </div>
  {:else if step == 'bought'}
    <div class="flex flex-col justify-center gap-5 my-8">
      <div class="text-3xl text-green-800">Success!</div>
      <div class="text-2xl">Your purchase was made successfully - your NFT will be sent to your address shortly!</div>
    </div>
    <div class="flex gap-3 justify-end">
      <Button on:click={close}>Close</Button>
    </div>
  {:else if step == 'error'}
    <div class="flex flex-col gap-5 my-8 text-left">
      <div class="text-3xl text-red-800">Error :(</div>
      <div class="text-2xl">{errorText}</div>
    </div>
    <div class="flex gap-3 justify-end">
      <Button on:click={close}>Close</Button>
    </div>
  {/if}
</Modal>