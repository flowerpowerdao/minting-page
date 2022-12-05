<script lang="ts">
    import CollectionInfo from "../components/CollectionInfo.svelte";
</script>

<!-- <BuyNftModal
    bind:open={buyNftModalOpen}
    count={buying.count}
    totalPrice={buying.totalPrice}
    on:success={fetchData}
/> -->
<!-- <LoginModal bind:open={loginModalOpen} /> -->

<!-- mobile -->
<div class="lg:hidden py-10">
    <CollectionInfo />
</div>

<!-- desktop -->
<div class="hidden lg:flex pt-40 pb-8 justify-between mx-[11%] flex-col">
    <CollectionInfo />
</div>
