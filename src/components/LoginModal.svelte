<script lang="ts">
  import Modal from "./Modal.svelte";
  import PlugButton from "./PlugButton.svelte";
  import StoicButton from "./StoicButton.svelte";

  export let open = false;
  
  export let toggleModal = () => {
    open = !open;
  };

  let loading = "";
</script>

<Modal title={"login with …"}  bind:open={open}>
  <div class="flex gap-3 flex-col pt-10 flex-1 justify-center items-center">
    <PlugButton bind:loading {toggleModal}/>
    <StoicButton bind:loading {toggleModal}/>
  </div>
</Modal>
