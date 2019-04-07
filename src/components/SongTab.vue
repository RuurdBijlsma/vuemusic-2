<template>
    <div class="song-tab">

        <md-list>
            <md-list-item class="md-list-item-button"
                          v-for="song in songs"
                          @click="playSong(song)"
                          v-bind:style="{ backgroundColor: (currentSong.id === song.id)?'rgba(0,0,0,0.15)':'transparent'}">
                <song-item v-bind:song="song"></song-item>
            </md-list-item>
        </md-list>
    </div>
</template>

<script>
    import StreamApi from "@/js/StreamApi";
    import Song from "@/js/Song";
    import SongItem from '@/components/SongItem';
    import MediaHelper from '@/js/MediaHelper';
    import Utils from '@/js/Utils';

    export default {
        name: 'SongTab',
        components: {SongItem},
        data() {
            return {
                songs: []
            }
        },
        props: {
            api: {type: StreamApi, required: true},
            currentSong: {type: Song, required: true}
        },
        methods: {
            removeSong: function (song) {

            },
            playlistAdd: function (song) {

            },
            playSong: async function (song) {
                this.$emit('play', song);
            },
            updateSongs: async function () {
                if (localStorage.getItem('songs') !== null)
                    this.songs = JSON.parse(localStorage.songs).map(Song.fromObject);

                try {
                    this.songs = (await this.api.songs()).map(Song.fromObject);
                    localStorage.songs = JSON.stringify(this.songs);
                    // noinspection JSIgnoredPromiseFromCall
                    MediaHelper.checkSongsCacheStatus(this.songs);
                } catch (ignored) {
                }
            },
        },
        async mounted() {
            await this.updateSongs();
        }
    }
</script>

<style scoped>
    .song-tab {
        padding-bottom: 100px;
    }
</style>
