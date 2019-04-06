<template>
    <div class="song-tab">

        <md-list>
            <md-list-item class="md-list-item-button"
                          v-for="song in songs"
                          v-bind:active="song.id === currentSong.id"
                          @click="playSong(song)">
                <div class="song-item">
                    <div class="thumbnail-square">
                        <div class="song-thumbnail"
                             v-bind:style="{ backgroundImage: 'url(' + song.thumbnail + ')' }"></div>
                        <div class="thumbnail-overlay" v-if="audioIsPlaying"></div>
                    </div>

                    <div class="song-info">
                        <div class="song-title">{{song.title}}</div>
                        <div class="song-bottom-info  md-caption">
                            <span class="song-artist">{{song.artist}}</span>
                            •
                            <span class="song-duration">{{secondsToHms(song.duration)}}</span>
                        </div>
                    </div>

                    <md-menu md-direction="bottom-end">
                        <md-button md-menu-trigger>
                            <md-icon>more_vert</md-icon>
                        </md-button>

                        <md-menu-content>
                            <md-menu-item @click="removeSong(song)">Remove</md-menu-item>
                            <md-menu-item @click="playlistAdd(song)">Add to playlist</md-menu-item>
                        </md-menu-content>
                    </md-menu>
                </div>
            </md-list-item>
        </md-list>
    </div>
</template>

<script>
    import StreamApi from "@/js/StreamApi";
    import Song from "@/js/Song";
    import Utils from "@/js/Utils";

    export default {
        name: 'SongTab',
        data() {
            return {
                songs: [],
                currentSong: new Song(),
                audioIsPlaying: false
            }
        },
        props: {
            api: {type: StreamApi, required: true},
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
                    this.songs = JSON.parse(localStorage.songs);
                this.songs = await this.api.songs();
                localStorage.songs = JSON.stringify(this.songs);
            },
            secondsToHms: Utils.secondsToHms
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

    .song-item {
        width: 100%;
        display: flex;
        flex-direction: row;
        height: 60px;
        padding: 0 5px;
        transition: 0.1s;
        cursor: pointer;
    }

    .md-menu {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 55px;
    }

    .song-thumbnail {
        pointer-events: none;
        height: 50px;
        width: 50px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        margin: 5px;
        position: relative;
        top: 0;
    }

    .song-item[active] .thumbnail-overlay {
        display: block;
    }

    .thumbnail-overlay {
        display: none;
        position: relative;
        top: -60px;
        width: calc(100% - 10px);
        height: calc(100% - 5px);
        margin: 5px;
        background: rgba(255, 255, 255, 0.4) url(../assets/playing.gif) no-repeat center;
        background-size: 50%;
        filter: invert(100%);
    }

    .song-info {
        pointer-events: none;
        display: flex;
        flex-direction: column;
        margin: 11px;
        flex-grow: 1;
        min-width: 0;
    }

    .song-title {
        font-size: 17px;
        font-weight: 400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
    }

    .song-bottom-info {
        font-size: 15px;
        font-weight: 100;
    }

    .song-options {
        min-width: 60px;
        text-align: center;
        border-radius: 50%;
        transform: scale(0.7);
    }
</style>
