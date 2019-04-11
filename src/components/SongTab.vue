<template>
    <div class="song-tab">
        <song-list
                @play="playSong"
                @add="add"
                @remove="remove"
                :songs="songs"
                :currentSong="currentSong"></song-list>
    </div>
</template>

<script>
    import StreamApi from "@/js/StreamApi";
    import Song from "@/js/Song";
    import MediaHelper from '@/js/MediaHelper';
    import SongList from '@/components/SongList';
    import NowPlaying from '@/js/NowPlaying';

    export default {
        name: 'song-tab',
        components: {SongList},
        data() {
            return {
                loaded: false,
                songs: []
            }
        },
        props: {
            currentSong: {type: Song, required: true},
            playlistId: {type: Number, required: true}
        },
        methods: {
            add: function (song) {
                this.$emit('add', song);
            },
            remove: function (song) {
                this.$emit('remove', song, this.playlistId);
            },
            playSong: async function (song) {
                this.$emit('play', song, 'favorites');
            },
            setSongs: function (songs) {
                this.songs = songs;
                NowPlaying.setQueue('favorites', songs, () => this.updateSongs());
            },
            updateSongs: async function () {
                if (localStorage.getItem('songs') !== null)
                    this.setSongs(JSON.parse(localStorage.songs).map(Song.fromObject));

                try {
                    this.setSongs((await StreamApi.favorites()).map(Song.fromObject));
                    localStorage.songs = JSON.stringify(this.songs);
                    // noinspection JSIgnoredPromiseFromCall
                    MediaHelper.checkSongsCacheStatus(this.songs);
                } catch (ignored) {
                }
            },
        },
        async mounted() {
            await this.updateSongs();
        },
    }
</script>

<style scoped>
</style>
