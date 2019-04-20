<template>
    <div class="artist">
        <song-list
                :current-song="currentSong"
                :songs="songs"
                :title="'Songs by '+$route.params.artistName"
                @play="playSong"
                @add="add"
                @remove="remove"
                @recache="recache"
        ></song-list>
    </div>
</template>

<script>
    import SongList from "../components/SongList";
    import Song from "../js/Song";
    import StreamApi from "../js/StreamApi";
    import NowPlaying from "@/js/NowPlaying";

    export default {
        name: 'artist',
        components: {SongList},
        props: {
            currentSong: {type: Song, required: true},
            favoritesId: {type: Number, required: true}
        },
        data() {
            return {
                songs: []
            }
        },
        async mounted() {
            this.getSongs();
        },
        methods: {
            add: function (song) {
                this.$emit('add', song);
            },
            remove: function (song) {
                this.$emit('remove', song, this.favoritesId);
            },
            playSong: async function (song) {
                this.$emit('play', song, 'artist_'+this.$route.params.artistName);
            },
            recache: async function (song) {
                this.$emit('recache', song);
            },
            async getSongs() {
                let songs = await StreamApi.artistSongs(this.$route.params.artistName);
                console.log(songs);
                NowPlaying.setQueue('artist_' + this.$route.params.artistName, songs, () => this.getSongs());
                this.songs = songs;
            }
        }
    }
</script>
