<template>
    <div class="song-item" @click="$emit('play')">
        <div class="thumbnail-square">
            <div class="song-thumbnail"
                 v-bind:style="{ backgroundImage: 'url(' + song.thumbnail + ')' }"></div>
            <!--                <md-icon v-if="current">volume_up</md-icon>-->
            <div class="thumbnail-overlay" v-if="song.isCaching">
                <md-progress-spinner v-if="song.isCaching" md-mode="indeterminate" class="md-accent" :md-stroke=3
                                     :md-diameter=40></md-progress-spinner>
            </div>
        </div>

        <div class="song-info">
            <div class="song-title">{{song.title}}</div>
            <div class="song-bottom-info  md-caption">
                <span class="song-cached"><md-icon v-if="!song.isCached">cloud</md-icon></span>
                <span class="song-artist">{{song.artist}}</span>
                <span v-if="song.duration >= 0" class="song-duration"> • {{secondsToHms(song.duration)}}</span>
            </div>
        </div>

        <md-menu md-direction="bottom-end" md-close-on-click @click="$event.stopPropagation()">
            <md-button md-menu-trigger>
                <md-icon>more_vert</md-icon>
            </md-button>

            <md-menu-content>
                <md-menu-item @click="$emit('remove')">Remove</md-menu-item>
                <md-menu-item @click="$emit('add')">Add to playlist</md-menu-item>
                <md-menu-item @click="$emit('recache')">Reload cache</md-menu-item>
            </md-menu-content>
        </md-menu>
    </div>
</template>

<script>
    import Utils from '@/js/Utils';
    import Song from '@/js/Song';

    export default {
        name: 'SongItem',
        props: {
            song: {type: Song, required: true},
        },
        methods: {
            secondsToHms: Utils.secondsToHms,
        },
        watch: {
            song: {
                handler() {
                    if (this.song.scrollIntoView) {
                        this.song.scrollIntoView = false;
                        this.$el.scrollIntoView({behavior: 'smooth', block: 'nearest'})
                    }
                },
                deep: true
            }
        }
    }
</script>

<style scoped>

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
        border-radius: 50%;
    }

    .thumbnail-overlay {
        top: -55px;
        position: relative;
        width: 50px;
        height: 50px;
        left: 5px;
        padding: 5px;
        background-color: rgba(0, 0, 0, 0.4);
        border-radius: 50%;
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
        font-size: 14px;
        font-weight: 100;
        height: 5px;
    }

    .song-cached > i {
        font-size: 14px !important;
        margin-top: -2px;
    }
</style>
