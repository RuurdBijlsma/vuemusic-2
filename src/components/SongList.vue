<template>
    <div class="song-tab">

        <md-list>
            <md-list-item class="md-list-item-button"
                          v-for="song in songs"
                          @click="playSong(song)"
                          v-bind:style="{ backgroundColor: (currentSong.id === song.id) ? 'rgba(0,0,0,0.15)' : 'transparent'}">
                <song-item v-bind:song="song"
                           v-on:remove="$emit('remove', song)"
                           v-on:add="$emit('add', song)"></song-item>
            </md-list-item>
        </md-list>
    </div>
</template>

<script>
    import Song from "@/js/Song";
    import SongItem from '@/components/SongItem';
    import MediaHelper from '@/js/MediaHelper';

    export default {
        name: 'SongTab',
        components: {SongItem},
        data() {
            return {}
        },
        props: {
            currentSong: {type: Song, required: true},
            songs: {type: Array, required: true}
        },
        methods: {
            playSong: async function (song) {
                this.$emit('play', song);
            },
        },
        mounted() {
            MediaHelper.checkSongsCacheStatus(this.songs);
        },
        watch: {
            songs() {
                MediaHelper.checkSongsCacheStatus(this.songs);
            }
        }
    }
</script>

<style scoped>
    .song-tab {
        padding-bottom: 100px;
    }
</style>
