<script lang="ts">
  import { store } from "../store";
  import Login from "./Login.svelte";
  import Logout from "./Logout.svelte";
</script>

<div class="flex justify-end">
  {#if !$store.isAuthed}
    <Login></Login>
  {:else}
    <div class="p-1 mx-5">{$store.principal?.toString().slice(0, 5) + "…" + $store.principal?.toString().slice(-3)}</div>
    <Logout></Logout>
  {/if}
</div>