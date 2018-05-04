<template>
    <div v-show="config.isLoading" class="loading">
        {{ config.msg }}
    </div>
</template>

<script>
    export default {
        name: "Loading",
        props: {
            config: {
                msg: String,
                isLoading: Boolean
            }
        }
    }
</script>

<style scoped>
    .loading {
        border: #333 1px;
        -webkit-border-radius: 5px;
        -moz-border-radius: 5px;
        border-radius: 5px;
        padding: 3px;
    }
</style>