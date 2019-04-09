<template>
    <div class="song-tab">
        <h3 v-if="songs.length === 0">No songs found</h3>
        <md-list>
            <md-subheader v-if="title">{{title}}</md-subheader>
            <md-list-item class="md-list-item-button"
                          v-for="song in songs"
                          :style="{ backgroundColor: (currentSong.id === song.id) ? 'rgba(0,0,0,0.15)' : 'transparent'}">
                <song-item :song="song"
                           @play="$emit('play', song)"
                           @remove="$emit('remove', song)"
                           @add="$emit('add', song)"></song-item>
            </md-list-item>
        </md-list>
    </div>
</template>

<script>
    import Song from "@/js/Song";
    import SongItem from '@/components/SongItem';
    import MediaHelper from '@/js/MediaHelper';

    export default {
        name: 'song-list',
        components: {SongItem},
        data() {
            return {}
        },
        props: {
            currentSong: {type: Song, required: true},
            songs: {type: Array, required: true},
            title: {type: String, required: false},
        },
        methods: {},
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
    h3 {
        text-align: center;
    }
</style>
