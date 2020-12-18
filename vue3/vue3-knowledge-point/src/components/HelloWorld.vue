<template>
    <div>
        <h2>{{ msg }}</h2>
    </div>
</template>

<script>
export default {
    name: "HelloWorld",
    props: {
        msg: String
    }
};
</script>
<style scoped>
h2 {
    color: #2dabff;
}
</style>
