<template>
    <div class="artist-tab">
        <h3 v-if="artists.length === 0">No artists found</h3>
        <md-list>
            <md-list-item @click="openArtistPage(artist)" class="md-list-item-button"
                          v-for="artist in artists">
                {{artist}}
            </md-list-item>
        </md-list>
    </div>
</template>

<script>
    import StreamApi from '../js/StreamApi';
    import Song from "../js/Song";

    export default {
        name: 'ArtistTab',
        data() {
            return {
                artists: []
            }
        },
        props: {
            currentSong: {type: Song, required: true},
            playlistId: {type: Number, required: true}
        },
        methods: {
            openArtistPage(artist) {
                console.log(artist);
            }
        },
        async mounted() {
        },
        watch: {
            async playlistId() {
                this.artists = await StreamApi.artists(this.playlistId);
            }
        }
    }
</script>

<style scoped>
</style>
