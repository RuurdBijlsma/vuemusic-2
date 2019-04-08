<template>
    <div class="search-content">
        <h1>Search page</h1>
    </div>
</template>

<script>
    import StreamApi from "@/js/StreamApi";

    export default {
        name: 'SearchPage',
        props: {
            api: {type: StreamApi, required: true},
            searchResults: []
        },
        methods:{
            search: function(query){

            }
        }
    }
</script>

<style scoped>
    .search-content {
        padding: 10px;
    }
</style>
