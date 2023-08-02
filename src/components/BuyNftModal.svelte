<script lang="ts">
  import { confetti } from "@neoconfetti/svelte";
  import Button from "fpdao-ui/components/Button.svelte";
  import Modal from "fpdao-ui/components/Modal.svelte";
  import Loader from "fpdao-ui/components/Loader.svelte";
  import spinner from "fpdao-ui/images/loading.gif";
  import { store, authStore } from "../store";
  import { fromErr, fromOk, isErr } from "../utils";
  import { collection } from "../collection";

  export let toggleBuyModal;
  export let count: bigint;
  export let price: bigint;

  let isDev = process.env.NODE_ENV;
  let loading = false;
  let step: "confirm" | "buying" | "bought" | "error" = "confirm";
  let progressText = "";
  let errorText = "";
  let boughtTokenIndex: number;
  let resolveConfetti;
  let confettiPromise: Promise<void>;
  let reserveTimeout = 1000 * 60; // 1 minute

  $: console.log(step);

  //   the method signature of `reserver` asks for a subaccount.
  // that parameter isn't used though so we just pass random bytes
  const _getRandomBytes = (): number[] => {
    var bs = [];
    for (var i = 0; i < 32; i++) {
      bs.push(Math.floor(Math.random() * 256));
    }
    // turn array of numbers into uint8 array
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
    store.update((state) => ({
      ...state,
      isBuying: true,
    }));

    try {
      // reserve
      let startTime = Date.now();
      let accountId = $authStore.accountId;
      console.log("reserving for account", accountId);

      let res = await $store.extActor.reserve(
        price,
        count,
        accountId,
        _getRandomBytes()
      );

      if (isErr(res)) {
        throw fromErr(res); // will be caught at the end of the method
      }

      let payToAddress = fromOk(res)[0];
      let priceToPay = fromOk(res)[1];
      console.log(
        `pay ${(Number(priceToPay) / 100000000).toFixed(2)} to ${payToAddress}`
      );

      // stop early before we send the payment
      if (Date.now() - startTime > reserveTimeout) {
        throw new Error("Reservation time has expired. Please try again.");
      }

      // transfer ICP
      progressText = "Transferring ICP...";
      // this can potentially fail, will be caught at the end of the method
      await authStore.transfer(payToAddress, priceToPay);

      // retrieve
      progressText = "Completing purchase...";

      while (true) {
        let res;
        try {
          res = await $store.extActor.retrieve(payToAddress);
        } catch (e) {
          // pause for 1 second
          setTimeout(() => {}, 1000);
          console.warn(e);
          continue; // if we can't reach the canister due to subnet or canister overloads, we just try again
        }
        // as soon as we receive an answer from the canister, the two following states are possible
        if ("ok" in res) {
          console.log(`bought nft`);
          break;
        }
        if ("err" in res) {
          console.error(res);
          throw "Your purchase failed! If ICP was sent and the sale ran out, you will be refunded shortly!"; // this throw will be caught at the end of the method
        }
      }

      // get just bought token
      let tokens = await $store.extActor.tokens(accountId);
      if ("ok" in tokens) {
        boughtTokenIndex = tokens.ok.at(-1);
      }

      step = "bought";

      // if preview enabled wait a while for the preview to load
      if (collection.previewEnabled) {
        confettiPromise = new Promise((resolve) => {
          resolveConfetti = () => {
            setTimeout(resolve, 2000);
          };
        });
      } else {
        confettiPromise = Promise.resolve();
      }

      store.update((state) => ({
        ...state,
        isBuying: false,
      }));
    } catch (err) {
      step = "error";
      errorText = err;
      store.update((state) => ({
        ...state,
        isBuying: false,
      }));
      throw err;
    }
  }
</script>

<Modal title="Buy NFT" toggleModal={toggleBuyModal}>
  {#if step == "confirm"}
    <div class="dark:text-white lg:text-3xl 2xl:text-4xl">
      Are you sure you want to continue with this purchase of <b>{count}</b>
      NFT{count === 1n ? "" : "s"} for the total price of
      <b>{(Number(price) / 100000000).toFixed(3)}</b> ICP? All transactions are final
      on confirmation and can't be reversed.
    </div>
    <div class="flex gap-3 flex-col flex-1 justify-center items-center mt-6">
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
    <div class="fixed bottom-2/4 left-2/4 pointer-events-none">
      {#await confettiPromise}
        <!-- wait for confetti delay -->
      {:then}
        <div
          use:confetti={{
            particleCount: 100,
            colors: ["#BB64D2", "#24A0F5", "#FED030", "#FC514B"],
            stageHeight: 1900,
            particleShape: "circles",
            force: 0.6,
          }}
        />
      {/await}
    </div>
    <div class="dark:text-white lg:text-3xl 2xl:text-4xl">
      Your purchase was made successfully - your NFT will be sent to your
      address shortly!
    </div>
    {#if collection.previewEnabled}
      <div class="flex justify-center">
        {#if isDev === "development"}
          <iframe
            class="border-0 mx-auto mt-5 overflow-hidden"
            style="max-width: 80vh; height: 40vh;"
            title=""
            frameborder="0"
            src="https://pk6rk-6aaaa-aaaae-qaazq-cai.raw.ic0.app/{boughtTokenIndex -
              1500}"
            on:load={resolveConfetti}
            on:error={resolveConfetti}
          />
          <!-- <img src="/src/assets/svelte.png" alt=""> -->
        {:else}
          <!-- svelte-ignore a11y-media-has-caption -->
          <video
            class="border-0 mx-auto mt-5 overflow-hidden"
            style="max-width: 80vh; height: 40vh;"
            title=""
            src="https://{collection.canisterId}.raw.ic0.app/?asset=0"
            on:load={resolveConfetti}
            on:error={resolveConfetti}
          />
        {/if}
      </div>
    {/if}
    <div class="flex gap-3 flex-col flex-1 justify-center items-center mt-6">
      <Button
        on:click={toggleBuyModal}
        style={"lg:h-16 2xl:h-20 lg:rounded-[55px]"}>close</Button
      >
    </div>
  {:else if step == "error"}
    <div class="flex flex-col justify-center gap-5">
      <div class="dark:text-white lg:text-3xl 2xl:text-4xl">
        {errorText}
      </div>
      <div class="flex gap-3 flex-col flex-1 justify-center items-center mt-6">
        <Button
          on:click={toggleBuyModal}
          style={"lg:h-16 2xl:h-20 lg:rounded-[55px]"}>close</Button
        >
      </div>
    </div>
  {/if}
</Modal>
