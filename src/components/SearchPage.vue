<template>
    <div class="search-content">
        <h3>Search results for {{searchTerm}}</h3>
        <song-list v-if="!loading" v-bind:songs="songResults" v-bind:current-song="currentSong" v-on:play="playSong"
                   v-on:add="add" v-on:remove="remove"></song-list>
        <div class="spinner-center-x" v-if="loading">
            <div class="spinner-center-y">
                <md-progress-spinner md-mode="indeterminate" class="md-accent"
                                     :md-stroke=4
                                     :md-diameter=60></md-progress-spinner>
            </div>
        </div>
    </div>
</template>

<script>
    import StreamApi from "@/js/StreamApi";
    import SongList from "@/components/SongList";
    import Song from "@/js/Song";


    export default {
        name: 'SearchPage',
        props: {
            api: {type: StreamApi, required: true},
            currentSong: {type: Song, required: true},
            searchTerm: {type: String, required: false},
        },
        components: {SongList},
        data() {
            return {
                // searchQuery: '',
                songResults: [],
                loading: false,
            }
        },
        methods: {
            add: function (song) {
                this.$emit('add', song);
            },
            remove: function (song) {
                this.$emit('remove', song, this.playlistId);
            },
            playSong: async function (song) {
                this.$emit('play', song);
            },
            search: async function (query) {
                this.loading = true;
                console.log(query);
                let results = await this.api.search(query);
                console.log(results);
                this.songResults = results;
                this.loading = false;
            }
        },
        mounted() {
            if (this.searchTerm !== '')
                this.search(this.searchTerm);
        },
        watch: {
            searchTerm() {
                if (this.searchTerm !== '')
                    this.search(this.searchTerm);
            }
        }
    }
</script>

<style scoped>
    h3 {
        text-align: center;
    }

    .search-content {
        min-height: 70vh;
    }

    .spinner-center-x {
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: 100%;
    }

    .spinner-center-y {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
    }
</style>
