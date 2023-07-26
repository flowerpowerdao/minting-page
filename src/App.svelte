<script lang="ts">
  import "./global.css";
  import Header from "fpdao-ui/components/Header.svelte";
  import Footer from "fpdao-ui/components/Footer.svelte";
  import Sale from "./pages/Sale.svelte";
  import { AuthStore, createAuthStore } from "fpdao-ui/auth-store";
  import { store } from "./store";
  import { onMount } from "svelte";

  let authStore = createAuthStore({
    host: process.env.DFX_NETWORK !== "ic" ? "http://localhost:4943" : "https://icp0.io",
  }) as AuthStore;

  onMount(async () => {
    await store.checkConnections();
  });
</script>

<Header {authStore} />
<Sale {authStore} />
<Footer {authStore} />
