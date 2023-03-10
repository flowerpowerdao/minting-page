<script lang="ts">
  import "./global.css";
  import Footer from "./components/Footer.svelte";
  import Header from "./components/Header.svelte";
  import Sale from "./pages/Sale.svelte";
  import { store } from "./store";
  import { onMount } from "svelte";

  onMount(async () => {
    await store.checkConnections();
  });
</script>

<Header />
<Sale />
<Footer />
