<template>
    <div class="search">
        <div v-if="loading" class="center-x">
            <div class="center-y">
                <md-progress-spinner md-mode="indeterminate"
                                     class="md-accent spinner"
                                     :md-stroke=3
                                     :md-diameter=60></md-progress-spinner>
            </div>
        </div>
        <song-list v-else
                   :title="'Search results for '+$route.params.query"
                   @play="playSong"
                   @add="add"
                   @remove="remove"
                   @recache="recache"
                   :current-song="currentSong"
                   :songs="songs"></song-list>
    </div>
</template>

<script>
    import SongList from "@/components/SongList";
    import StreamApi from "@/js/StreamApi";
    import Song from "@/js/Song";
    import NowPlaying from "@/js/NowPlaying";

    export default {
        name: 'search',
        components: {
            SongList
        },
        props: {
            currentSong: {type: Song, required: true},
            favoritesId: {type: Number, required: true}
        },
        data() {
            return {
                songs: [],
                loading: false
            }
        },
        methods: {
            add: function (song) {
                this.$emit('add', song);
            },
            remove: function (song) {
                this.$emit('remove', song, this.favoritesId);
            },
            playSong: async function (song) {
                this.$emit('play', song, 'search');
            },
            recache: async function (song) {
                this.$emit('recache', song);
            },
            async search(query) {
                this.loading = true;
                this.songs = await StreamApi.search(query);
                this.loading = false;

                NowPlaying.setQueue('search', this.songs, () => this.search(query));
            }
        },
        async mounted() {
            this.search(this.$route.params.query);
        },
        watch: {
            '$route'(to) {
                this.search(to.params.query);
            }
        }
    }
</script>

<style scoped>
    .center-x {
        width: 100%;
        height: 70vh;
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    .center-y {
        height: 70vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .spinner {
        position: relative;
        left: 0px;
    }
</style>