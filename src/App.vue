<template>
    <div class="app">

        <md-app md-waterfall md-mode="fixed-last">
            <md-app-toolbar class="md-dense md-primary">
                <div class="md-toolbar-row">
                    <div class="search-bar ">
                        <md-icon class="search-icon">search</md-icon>
                        <input type="text" class="search-input"
                               placeholder="Search"
                               v-model="searchQuery"
                               v-on:keydown.enter="search()">
                        <md-button class="md-icon-button search-cancel"
                                   @click="searchQuery = ''"
                                   v-bind:style="{ opacity: searchQuery === '' ? 0 : 1 }">
                            <md-icon>cancel</md-icon>
                        </md-button>
                    </div>

                    <div class="md-toolbar-section-end">
                        <md-button class="md-icon-button">
                            <md-avatar class="md-avatar-icon md-secondary">A</md-avatar>
                        </md-button>
                    </div>
                </div>

            </md-app-toolbar>


            <md-app-content>
                <div v-if="page===0">
                    <md-tabs class="md-primary">
                        <md-tab id="tab-songs" md-label="Songs">
                            <song-tab ref="songTab" v-on:play="playSong" v-bind:api="api"></song-tab>
                        </md-tab>
                        <md-tab id="tab-artists" md-label="Artists">
                            <artist-tab></artist-tab>
                        </md-tab>
                        <md-tab id="tab-playlists" md-label="Playlists">
                            <playlist-tab></playlist-tab>
                        </md-tab>
                    </md-tabs>
                </div>
                <search-page v-if="page===1"></search-page>
                <playlist-page v-if="page===2"></playlist-page>

            </md-app-content>
        </md-app>

        <div class="player">
            <div class="player-container">
                <div class="player-thumbnail"
                     v-bind:style="{ backgroundImage: 'url(' + currentSong.thumbnail + ')' }"></div>
                <div class="player-info">
                    <div class="player-title">{{currentSong.title}}</div>
                    <div class="player-artist">{{currentSong.artist}}</div>
                </div>
                <div class="player-controls">
                    <md-button @click="skip(-1)">
                        <md-icon>skip_previous</md-icon>
                    </md-button>
                    <div class="center-play-icon">
                        <md-progress-spinner v-if="loading" md-mode="indeterminate" class="md-accent spinner" :md-stroke=2
                                             :md-diameter=30></md-progress-spinner>
                        <md-button v-else class="player-play" v-on:click="togglePlayPause()">
                            <md-icon v-if="playing">pause</md-icon>
                            <md-icon v-else>play_arrow</md-icon>
                        </md-button>
                    </div>
                    <md-button @click="skip(1)">
                        <md-icon>skip_next</md-icon>
                    </md-button>
                </div>
            </div>
            <audio class="audio-player"></audio>
            <div class="seek-information">
                <span>{{secondsToHms(progress / 100 * currentSong.duration)}}</span>
                <div class="seek-bar" v-on:mousedown="startSeeking($event)"
                     v-on:touchstart="startSeeking($event.touches[0])">
                    <div class="seek-background" v-bind:style="{ backgroundColor: currentSong.color }"></div>
                    <div class="seek-progress"
                         v-bind:style="{ backgroundColor: currentSong.color, width: progress + '%'}"></div>
                    <div class="seek-thumb"
                         v-bind:style="{ backgroundColor: currentSong.color, left: 'calc(' + progress + '% - 4.5px)'}"></div>
                </div>
                <span>{{secondsToHms(currentSong.duration)}}</span>
            </div>
        </div>

    </div>
</template>

<script>
    import SearchPage from './components/SearchPage.vue';
    import PlaylistPage from './components/PlaylistPage.vue';
    import SongTab from './components/SongTab';
    import ArtistTab from './components/ArtistTab';
    import PlaylistTab from './components/PlaylistTab';
    import MediaHelper from './js/MediaHelper';
    import StreamApi from './js/StreamApi';
    import Song from "@/js/Song";
    import Utils from '@/js/Utils';

    const isLocal = location.href.includes('localhost') || location.href.includes('127.0.0.1');
    const server = isLocal ? 'http://localhost:3000' : 'https://rtc.ruurd.dev:3000';
    const api = new StreamApi(server);


    export default {
        name: 'app',
        data() {
            return {
                currentSong: new Song(),
                page: 0,
                searchQuery: "",
                api,
                progress: 0,
                playing: false,
                loading: false,
                updatingInterval: false,
                currentPlaylist: []
            }
        },
        components: {
            SearchPage,
            PlaylistPage,
            SongTab,
            ArtistTab,
            PlaylistTab
        },
        async mounted() {
            this.page = +location.hash.substr(1);
            window.addEventListener('hashchange', () => {
                this.page = +location.hash.substr(1);
            });
            document.addEventListener('mouseup', e => this.endSeeking(e));
            document.addEventListener('touchend', e => this.endSeeking(e.changedTouches[0]));
            document.addEventListener('mousemove', e => this.seek(e));
            document.addEventListener('touchmove', e => this.seek(e.touches[0]));

            this.updatingInterval = setInterval(() => {
                let player = document.querySelector('.audio-player');
                if (!player.duration || !player.currentTime)
                    return 0;
                let progress = player.currentTime / player.duration;
                this.progress = Math.round(progress * 10000) / 100;
            }, 10);

            //this.playlists = await api.playlists();

            if (localStorage.getItem('lastPlaylist')) {
                this.loadPlaylist('favorites');
            } else {
                this.loadPlaylist('favorites');
            }

            if (localStorage.getItem('lastPlayedSong')) {
                this.loadSong(this.currentPlaylist.find(s => s.id === localStorage.lastPlayedSong));
            } else {
                this.loadSong(this.currentPlaylist[0]);
            }
        },
        methods: {
            loadPlaylist: function (playlistName) {
                // this.currentPlaylist = this.playlists.find(p => p.name === playlistName);
                this.currentPlaylist = this.$refs.songTab.songs;
                localStorage.lastPlaylist = playlistName;
            },
            search: function () {
                this.setPage(1);
            },
            setPage: function (page) {
                window.location.hash = page;
            },
            skip: async function (n) {
                console.log('skip', n);
            },
            playSong: async function (song) {
                await this.loadSong(song);
                this.togglePlayPause(true);
            },
            loadSong: async function (song) {
                return new Promise(async resolve => {
                    this.currentSong = song;
                    this.setSongMetaData(song);
                    localStorage.lastPlayedSong = song.id;
                    this.loading = true;
                    let player = document.querySelector('.audio-player');
                    player.pause();
                    player.src = await MediaHelper.getAudioSource(this.api, song.id);
                    player.load();
                    player.onended = () => {
                        this.skip(1);
                    };
                    player.oncanplay = async () => {
                        this.loading = false;
                        resolve();
                        await MediaHelper.cacheSongLocallyIfNeeded(this.api, song);
                        player.oncanplay = () => {
                        };
                    };
                });
            },
            togglePlayPause: async function (setPlaying) {
                let player = document.querySelector('.audio-player');

                if (setPlaying === undefined) {
                    setPlaying = player.paused;
                }
                if (setPlaying) {
                    await player.play();
                    this.playing = true;
                } else {
                    player.pause();
                    this.playing = false;
                }
            },
            setSongMetaData: function (song) {
                document.title = song.artist + ' - ' + song.title;
                document.querySelector('meta[name="theme-color"').content = song.color;

                if (!('mediaSession' in navigator))
                    return;

                navigator.mediaSession.metadata = new MediaMetadata({
                    title: song.title,
                    artist: song.artist,
                    artwork: [
                        {src: song.thumbnail, type: 'image/png'},
                    ]
                });
                navigator.mediaSession.setActionHandler('play', async () => {
                    await this.togglePlayPause(true);
                });
                navigator.mediaSession.setActionHandler('pause', async () => {
                    await this.togglePlayPause(false);
                });
                navigator.mediaSession.setActionHandler('previoustrack', () => {
                    this.$emit('skip', -1);
                });
                navigator.mediaSession.setActionHandler('nexttrack', () => {
                    this.$emit('skip', 1);
                });
            },
            startSeeking: function (e) {
                this.seeking = true;
                this.seekByEvent(e);
            },
            endSeeking: function (e) {
                this.seeking = false;
            },
            seek: function (e) {
                if (this.seeking)
                    this.seekByEvent(e);
            },
            seekByEvent: function (e) {
                let seekbar = document.querySelector('.seek-bar');
                let seekValue = (e.pageX - seekbar.offsetLeft) / seekbar.offsetWidth;
                seekValue = Math.max(0, seekValue);
                this.seekByValue(seekValue);
            },
            seekByValue: function (percentage) {
                let player = document.querySelector('.audio-player');
                let time = 0;
                if (player.duration)
                    time = player.duration * percentage;
                player.currentTime = time;
            },
            secondsToHms: Utils.secondsToHms
        }
    }
</script>

<style>
    .app {
        font-family: 'Roboto', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    .music-player {
        position: fixed;
        width: 100%;
        bottom: 0;
        left: 0;
        height: 100px;
        background-color: red;
        z-index: 5;
    }

    .md-content.md-tabs-content {
        height: auto !important;
    }

    .md-tab {
        padding: 0 !important;
    }

    .md-app-content {
        padding: 0px !important;
        margin-top: 0px !important;
    }

    .player-controls {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        width: 130px;
        padding: 10px;
    }

    .player-controls .md-button, .center-play-icon {
        min-width: 35px;
    }

    .center-play-icon{
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    .center-play-icon>*{
        position: absolute !important;
        display: flex;
        flex-direction: row;
        justify-content: center;
        right:36px;
    }

    .spinner{
        right: 51px;
        bottom: 21px;
    }
    
    .search-bar {
        display: flex;
        flex-direction: row;
        background-color: rgba(255, 255, 255, 0.3);
        height: 3em;
        border-radius: 0.5em;
        width: 100%;
        justify-content: space-around;
        margin-right: 0.5em;
    }

    .search-icon, .search-cancel {
        transform: scale(0.8);
    }

    .player {
        position: fixed;
        width: 100%;
        height: 100px;
        bottom: 0;
        background-color: rgb(200, 200, 200);
    }

    .search-input {
        background-color: transparent;
        width: calc(100% - 6em);
        border: none;
    }

    .search-input:focus {
        outline: none;
    }

    .search-bar > input {
        color: white;
        font-size: 1em;
    }

    .seek-information {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 0 10px;
    }

    .seek-bar {
        position: relative;
        width: calc(100% - 100px);
        border-radius: 5px;
        height: 25px;
        bottom: 3px;
    }

    .seek-bar > div {
        pointer-events: none;
    }

    .seek-background {
        border-radius: 5px;
        position: absolute;
        width: 100%;
        top: 7px;
        height: 12px;
        background-color: rgba(255, 255, 255, 0.6);
        filter: brightness(40%);
    }

    .seek-progress {
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
        position: absolute;
        width: 30%;
        top: 7px;
        height: 12px;
        background-color: rgba(255, 255, 255, 0.6);
        filter: brightness(100%);
    }

    .seek-thumb {
        position: absolute;
        left: calc(30% - 4.5px);
        height: 12px;
        top: 7px;
        background-color: white;
        width: 5px;
        filter: brightness(200%);
    }

    .player-container {
        display: flex;
        flex-direction: row;
        position: relative;
        left: 0;
        width: 100%;
    }

    .player-thumbnail {
        height: 45px;
        min-width: 45px;
        margin: 12px;
        margin-right: 4px;
        background-size: cover;
        background-position: center;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.6);
    }

    .player-info {
        display: flex;
        flex-direction: column;
        padding: 15px 10px;
        flex-grow: 1;
        min-width: 0px;
    }

    .player-title {
        font-size: 17px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .player-artist {
        font-size: 15px;
        font-weight: 300;
    }

    .player-play {
        min-width: 80px;
        height: 70px;
        text-align: center;
    }

    .player-play i {
        line-height: 70px;
        height: 70px;
        font-size: 30px !important;
    }

    ::placeholder {
        color: rgba(255, 255, 255, 0.5);
    }
</style>
