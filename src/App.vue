<!--TODO-->
<!-- playlists -->
<!--Currently playing sharable page for individual songs with visualization :)-->
<!-- If app is started offline, or server hangs, playlist list isn't loaded and song cant be added to playlist-->

<template>
    <div id="app">
        <md-content class="top-toolbar md-primary">
            <div class="search-bar ">
                <md-button class="md-icon-button search-back" @click="$router.push('/'); searchQuery = ''">
                    <md-icon v-if="['search','artist'].includes($route.name)" class="search-icon">arrow_back</md-icon>
                    <md-icon v-else class="search-icon">search</md-icon>
                </md-button>
                <input type="text" class="search-input"
                       placeholder="Search"
                       @keydown.enter="performSearch($event)"
                       v-model="searchQuery">
                <md-button class="md-icon-button search-cancel"
                           @click="clearSearch()"
                           :style="{ opacity: searchQuery === '' ? 0 : 1 }">
                    <md-icon>cancel</md-icon>
                </md-button>
            </div>
            <md-menu md-direction="bottom-end" md-close-on-click>
                <md-button md-menu-trigger class="md-icon-button md-primary login-avatar">
                    <md-avatar class="md-avatar-icon">{{firstLetter}}</md-avatar>
                </md-button>

                <md-menu-content>
                    <md-menu-item @click="logout()">Log out</md-menu-item>
                    <md-menu-item @click="cacheAllOnline()">Cache all songs offline</md-menu-item>
                </md-menu-content>
            </md-menu>
        </md-content>
        <md-content class="main-content">
            <router-view
                    @play="playSong"
                    @add="showPlaylistDialog"
                    @remove="removeFromPlaylist"
                    @recache="recache"
                    :current-song="currentSong"
                    :favorites-id="favoritesId"/>

            <md-button @click="toggleShuffle()" class="md-fab shuffle-fab"
                       :class="shuffleEnabled ? 'md-accent' : 'md-primary'">
                <md-icon>shuffle</md-icon>
            </md-button>
        </md-content>
        <md-content class="bottom-player md-elevation-2">
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
                        <md-progress-spinner v-if="loading"
                                             md-mode="indeterminate"
                                             class="md-accent spinner"
                                             :md-stroke=2
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
                <span :style="{opacity: currentSong.duration>=0 ? 1 : 0}">{{secondsToHms(currentSong.duration)}}</span>
            </div>
        </md-content>
        <md-dialog :md-active.sync="showDialog" :md-fullscreen="false">
            <md-dialog-title>Add to playlist</md-dialog-title>
            <md-list>
                <md-subheader>{{songToAdd.artist}} - {{songToAdd.title}}</md-subheader>
                <md-list-item class="md-list-item-button" v-for="playlist in playlists">
                    <md-button class="md-ripple add-button" @click="addToPlaylist(songToAdd, playlist.playlistid)">
                        {{playlist.name}}
                    </md-button>
                </md-list-item>
            </md-list>

            <md-dialog-actions>
                <md-button class="md-accent" @click="showDialog = false">Cancel</md-button>
            </md-dialog-actions>
        </md-dialog>
    </div>
</template>

<script>
    import SongTab from './components/SongTab';
    import ArtistTab from './components/ArtistTab';
    import PlaylistTab from './components/PlaylistTab';
    import MediaHelper from './js/MediaHelper';
    import StreamApi from './js/StreamApi';
    import Song from "@/js/Song";
    import Utils from '@/js/Utils';
    import NowPlaying from '@/js/NowPlaying';
    import AccountManager from '@/js/AccountManager';
    import Swal from 'sweetalert2';
    import FileStorage from "./js/FileStorage";

    // const isLocal = location.href.includes('localhost') || location.href.includes('127.0.0.1');
    const isLocal = false;
    const server = isLocal ? 'http://localhost:3000' : 'https://ruurd.dev:3000';
    StreamApi.setServer(server);

    export default {
        name: 'App',
        data() {
            return {
                currentSong: new Song(),
                searchQuery: "",
                progress: 0,
                playing: false,
                loading: false,
                updatingInterval: false,
                currentPlaylist: [],
                playlists: [],
                favoritesId: -1,
                showDialog: false,
                songToAdd: new Song(),
                firstLetter: 'A',
                shuffleEnabled: false
            }
        },
        components: {
            SongTab,
            ArtistTab,
            PlaylistTab
        },
        async mounted() {
            if (!AccountManager.isLoggedIn && this.$route.name !== 'login') {
                this.$router.push('/login?redirect=' + encodeURIComponent(location.href));
            }
            this.firstLetter = StreamApi.user.user.substr(0, 1).toUpperCase();

            console.log(NowPlaying);
            this.searchQuery = this.$route.params.query || '';
            try {
                //todo offline playlists
                this.playlists = await StreamApi.playlists();
                this.favoritesId = this.playlists.find(p => p.name === 'favorites').playlistid;
            } catch (e) {
            }

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

            this.loadInitialSong();
        },
        methods: {
            async recache(song) {
                console.log('recache', song);
                if (this.currentSong.id === song.id)
                    if (NowPlaying.queue.songs.length > 1)
                        this.skip(1).then(() => this.togglePlayPause(false));
                    else
                        this.currentSong = new Song();
                await FileStorage.remove(song.id);
                await MediaHelper.cacheSongLocallyIfNeeded(song);
            },
            async cacheAllOnline() {
                let tasks = NowPlaying.queue.songs.map(s => MediaHelper.cacheSongLocallyIfNeeded(s));
                await Promise.all(tasks);
            },
            toggleShuffle() {
                this.shuffleEnabled = !this.shuffleEnabled;
                if (this.shuffleEnabled) {
                    NowPlaying.reshuffle(NowPlaying.queueName);
                }
            },
            logout() {
                Swal.fire({
                    title: 'Are you sure you want to log out?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, logout'
                }).then((result) => {
                    if (result.value) {
                        AccountManager.logout();
                        location.reload();
                    }
                })
            },
            clearSearch() {
                this.searchQuery = '';
                document.querySelector('.search-input').focus();
            },
            performSearch: function (e) {
                e.target.blur();
                this.$router.push('/search/' + this.searchQuery);
                console.log(this.searchQuery);
            },
            removeFromPlaylist: async function (song, playlistId) {
                await StreamApi.remove(song.id, playlistId);
                if (playlistId === this.favoritesId) {
                    NowPlaying.playlistQueues.favorites.update();
                } else {
                    NowPlaying.playlistQueues[playlistId].update();
                }
                //todo als playlist id een playlist is die nu open staat refresh die dan
            },
            async addToPlaylist(song, playlistId) {
                this.showDialog = false;
                if (song.id === '')
                    return;
                try {
                    await StreamApi.save(song.id, playlistId);
                    if (playlistId === this.favoritesId)
                        NowPlaying.playlistQueues.favorites.update();
                    else
                        NowPlaying.playlistQueues[playlistId].update();
                } catch (e) {
                    alert("Can't reach server, song has not been added to playlist");
                }
            },
            showPlaylistDialog: async function (song) {
                this.showDialog = true;
                this.songToAdd = song;
            },
            loadInitialSong: function () {
                let initialSong;
                if (localStorage.getItem('lastPlayedSong'))
                    initialSong = Song.fromObject(JSON.parse(localStorage.lastPlayedSong));
                else
                    initialSong = NowPlaying.queue.songs[0];

                if (initialSong)
                    this.loadSong(initialSong);
            },
            skip: async function (n) {
                if (n === -1) {
                    let player = document.querySelector('.audio-player');
                    if (player.currentTime > 5) {
                        player.currentTime = 0;
                        return;
                    }
                }
                let playlist = this.shuffleEnabled ? NowPlaying.queue.shuffledSongs : NowPlaying.queue.songs;
                let currentIndex = playlist.findIndex(s => s.id === this.currentSong.id);

                let newIndex = (currentIndex + n) % playlist.length;
                while (newIndex < 0)
                    newIndex += playlist.length;

                playlist[newIndex].scrollIntoView = true;
                await this.playSong(playlist[newIndex], NowPlaying.queueName);
            },
            playSong: async function (song, queue = 'favorites') {
                NowPlaying.queueName = queue;
                //todo Set queue to favorites
                await this.loadSong(song);
                this.togglePlayPause(true);
            },
            loadSong: async function (song) {
                let player = document.querySelector('.audio-player');
                if (song.id === this.currentSong.id && player.currentTime && player.duration !== Infinity) {
                    //if song is already loaded
                    player.currentTime = 0;
                    await player.play();
                    return;
                }

                return new Promise(async resolve => {
                    this.loading = true;
                    this.currentSong = song;
                    this.setSongMetaData(song);
                    localStorage.lastPlayedSong = JSON.stringify(song);
                    player.pause();
                    let url = await MediaHelper.getAudioSource(song);
                    if (this.currentSong.id !== song.id) return;
                    player.src = url;
                    player.load();
                    player.onended = () => {
                        this.skip(1);
                    };
                    player.oncanplay = async () => {
                        if (player.duration)
                            song.duration = player.duration;
                        this.loading = false;
                        resolve();
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
                    navigator.mediaSession.playbackState = "playing";
                    this.playing = true;
                    await player.play();
                } else {
                    navigator.mediaSession.playbackState = "paused";
                    this.playing = false;
                    player.pause();
                }
            },
            setSongMetaData: function (song) {
                document.title = song.artist + ' - ' + song.title;
                // document.querySelector('meta[name="theme-color"').content = song.color;

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
                    this.skip(-1);
                });
                navigator.mediaSession.setActionHandler('nexttrack', () => {
                    this.skip(1);
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
        },
        watch: {}
    }
</script>

<style>
    @import url('https:////fonts.googleapis.com/css?family=Roboto:400,500,700,400italic|Material+Icons');

    body {
        overflow-y: hidden
    }

    #app {
        overscroll-behavior: none;
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
    }

    .top-toolbar {
        z-index: 3;
        position: fixed;
        top: 0;
        width: 100%;
        height: 60px;
        padding: 5px;
        display: flex;
        flex-direction: row;
    }

    .top-toolbar > input {
        border: none;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.4) none;
        height: calc(100% - 15px);
        width: calc(100% - 70px);
        margin: 7.5px;
        padding: 10px;
        font-size: 14px;
        color: white;
        font-weight: 500;
    }

    .login-avatar {
        top: 5px;
    }

    .top-toolbar > input:focus {
        outline: none;
    }

    .main-content {
        z-index: 1;
        height: calc(100% - 160px);
        position: fixed;
        top: 60px;
        width: 100%;
        overflow-y: auto;
    }

    .shuffle-fab {
        position: fixed !important;
        bottom: 115px;
        right: 10px;
    }

    .bottom-player {
        z-index: 3;
        position: fixed;
        bottom: 0;
        height: 100px;
        width: 100%;
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

    .center-play-icon {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    .center-play-icon > * {
        position: absolute !important;
        display: flex;
        flex-direction: row;
        justify-content: center;
        right: 36px;
    }

    .spinner {
        right: 51px;
        bottom: 21px;
    }

    .player {
        position: fixed;
        width: 100%;
        height: 100px;
        bottom: 0;
        background-color: rgb(200, 200, 200);
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
        text-align: center;
    }

    .player-play i {
        /*line-height: 70px;*/
        /*height: 70px;*/
        font-size: 30px !important;
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

    .search-bar {
        display: flex;
        flex-direction: row;
        background-color: rgba(255, 255, 255, 0.3);
        height: 3em;
        border-radius: 0.5em;
        width: 100%;
        justify-content: space-around;
        margin: 5px;
    }

    .search-bar .md-icon {
        color: white !important;
    }

    .search-icon, .search-cancel {
        transform: scale(0.8);
    }

    ::placeholder {
        color: rgba(255, 255, 255, 0.5);
    }
</style>
