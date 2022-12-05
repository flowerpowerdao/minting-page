<script lang="ts">
  import Button from "./Button.svelte";
  import Modal from "./Modal.svelte";
  import { store } from "../store";
  import spinner from "../assets/loading.gif";
  import { createEventDispatcher } from "svelte";
  import Loader from "./Loader.svelte";
  import { fromErr, fromOk, isErr } from "../utils";

  export let toggleBuyModal;
  export let count: bigint;
  export let price: bigint;

  let loading = false;
  let error = "";
  let step: "confirm" | "buying" | "bought" | "error" = "confirm";
  let progressText = "";
  let errorText = "";
  let dispatch = createEventDispatcher();

  // $: {
  //   if (!open) {
  //     reset();
  //   }
  // }

  //   the method signature of `reserver` asks for a subaccount.
  // that parameter isn't used though so we just pass random bytes
  const _getRandomBytes = () => {
    var bs = [];
    for (var i = 0; i < 32; i++) {
      bs.push(Math.floor(Math.random() * 256));
    }
    return bs;
  };

  function reset() {
    step = "confirm";
    progressText = "";
    errorText = "";
  }

  async function buy() {
    step = "buying";
    progressText = "Reserving NFT...";

    try {
      // reserve
      let accountId = $store.accountId;
      console.log("reserving for account", accountId);
      let res = await $store.extActor.reserve(
        price,
        count,
        accountId,
        _getRandomBytes()
      );

      if (isErr(res)) {
        throw fromErr(res);
      }

      let payToAddress = fromOk(res)[0];
      let priceToPay = fromOk(res)[1];

      // transfer ICP
      progressText = "Transferring ICP...";
      await store.transfer(payToAddress, priceToPay);

      // retreive
      progressText = "Completing purchase...";

      while (true) {
        let res;
        try {
          res = await $store.extActor.retreive(payToAddress);
        } catch (e) {
          continue;
        }
        if ("ok" in res) break;
        if ("err" in res)
          throw "Your purchase failed! If ICP was sent and the sale ran out, you will be refunded shortly!";
      }

      step = "bought";

      dispatch("success");
    } catch (err) {
      step = "error";
      errorText = err;
      throw err;
    }
  }
</script>

<Modal title="Buy NFT" toggleModal={toggleBuyModal}>
  {#if step == "confirm"}
    <div class="mt-2 dark:text-white lg:text-3xl 2xl:text-4xl">
      Are you sure you want to continue with this purchase of <b>{count}</b>
      NFT{count === 1n ? "" : "s"} for the total price of
      <b>{BigInt(price) / 100000000n}</b> ICP? All transactions are final on confirmation
      and can't be reversed.
    </div>
    <div class="flex gap-3 flex-col flex-1 justify-center items-center">
      <Button
        on:click={buy}
        disabled={loading}
        style={"lg:h-16 2xl:h-20 lg:rounded-[55px] disabled:cursor-not-allowed"}
      >
        {#if loading}
          <img class="h-6" src={spinner} alt="loading animation" />
        {:else}
          submit
        {/if}
      </Button>
      <Button
        on:click={toggleBuyModal}
        style={"lg:h-16 2xl:h-20 lg:rounded-[55px]"}>cancel</Button
      >
    </div>
  {:else if step == "buying"}
    <div class="flex items-center justify-center gap-5 my-20">
      <Loader />
      <div class="text-3xl">{progressText}</div>
    </div>
  {:else if step == "bought"}
    <div class="flex flex-col justify-center gap-5 my-8">
      <div class="mt-2 dark:text-white lg:text-3xl 2xl:text-4xl">
        Your purchase was made successfully - your NFT will be sent to your
        address shortly!
      </div>
      <div class="flex gap-3 flex-col flex-1 justify-center items-center">
        <Button
          on:click={toggleBuyModal}
          style={"lg:h-16 2xl:h-20 lg:rounded-[55px]"}>close</Button
        >
      </div>
    </div>
  {:else if step == "error"}
    <div class="flex flex-col justify-center gap-5 my-8">
      <div class="mt-2 dark:text-white lg:text-3xl 2xl:text-4xl">
        {errorText}
      </div>
      <div class="flex gap-3 flex-col flex-1 justify-center items-center">
        <Button
          on:click={toggleBuyModal}
          style={"lg:h-16 2xl:h-20 lg:rounded-[55px]"}>close</Button
        >
      </div>
    </div>
  {/if}
</Modal>
