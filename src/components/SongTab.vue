<template>
    <div class="song-tab">
        <song-list
                v-on:play="playSong"
                v-on:add="add"
                v-on:remove="remove"
                v-bind:songs="songs"
                v-bind:currentSong="currentSong"></song-list>
    </div>
</template>

<script>
    import StreamApi from "@/js/StreamApi";
    import Song from "@/js/Song";
    import SongItem from '@/components/SongItem';
    import MediaHelper from '@/js/MediaHelper';
    import SongList from '@/components/SongList';

    export default {
        name: 'SongTab',
        components: {SongItem, SongList},
        data() {
            return {
                songs: [],
                loaded: false,
            }
        },
        props: {
            api: {type: StreamApi, required: true},
            currentSong: {type: Song, required: true},
            playlistId: {type: Number, required: true}
        },
        methods: {
            add: function(song){
                this.$emit('add', song);
            },
            remove: function(song){
                this.$emit('remove', song, this.playlistId);
            },
            playSong: async function (song) {
                this.$emit('play', song);
            },
            updateSongs: async function () {
                if (localStorage.getItem('songs') !== null)
                    this.songs = JSON.parse(localStorage.songs).map(Song.fromObject);

                try {
                    this.songs = (await this.api.favorites()).map(Song.fromObject);
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
    .song-tab {
        padding-bottom: 100px;
    }
</style>
