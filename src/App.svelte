<script lang="ts">
  import { onMount } from "svelte";
  import "fpdao-ui/styles/global.css";
  import Header from "fpdao-ui/components/Header.svelte";
  import Footer from "fpdao-ui/components/Footer.svelte";
  import Sale from "./components/Sale.svelte";
  import { authStore } from './store';

  onMount(async () => {
    await authStore.checkConnections();
  });
</script>

<Header {authStore} />
<Sale />
<Footer {authStore} />
