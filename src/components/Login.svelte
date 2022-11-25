<script lang="ts">
  import LoginModal from "./LoginModal.svelte";

  let open = false;

  function toggleModal() {
    open = !open;
  }
</script>

<button
  on:click={toggleModal}
  class="hover:shadow dark:hover:shadow-white flex-1 lg:flex-none font-mono -ml-0.5 text-xl lg:text-base 2xl:text-xl bg-white dark:bg-black border-black dark:border-white dark:text-white border-2 rounded-t-3xl lg:rounded-t-none lg:rounded-b-[37px] lg:min-w-[300px]"
  >login</button
>
<LoginModal bind:open={open} />