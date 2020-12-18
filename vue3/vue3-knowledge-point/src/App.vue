<template>
    <div>
        <img alt="Vue logo" src="./assets/logo.png" />
        <Diff></Diff>
        <HoistStast></HoistStast>
        <CacheHandlers></CacheHandlers>
        <SSR></SSR>
    </div>
</template>

<script>
// 01: vue2.x compare vue3 
import Diff from './components/vue3-01-compare.vue2/01_diff.vue';
import HoistStast from './components/vue3-01-compare.vue2/02_hoistStast.vue';
import CacheHandlers from './components/vue3-01-compare.vue2/03_cacheHandlers.vue';
import SSR from './components/vue3-01-compare.vue2/04_ssr.vue';

export default {
    name: "App",
    components: {
        Diff,
        HoistStast,
        CacheHandlers,
        SSR
    }
};
</script>
