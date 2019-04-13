<template>
    <div class="home">
        <md-tabs md-sync-route class="md-primary">
            <md-tab id="tab-songs" md-label="Songs" to="/home/songs">
                <song-tab
                        @play="playSong"
                        @add="add"
                        @remove="remove"
                        :current-song="currentSong"
                        :playlist-id="favoritesId"></song-tab>
            </md-tab>

            <md-tab id="tab-artists" md-label="Artists" to="/home/artists">
                <artist-tab
                        @play="playSong"
                        @add="add"
                        @remove="remove"
                        :current-song="currentSong"
                        :playlist-id="favoritesId"></artist-tab>
            </md-tab>

            <md-tab id="tab-playlists" md-label="Playlists" to="/home/playlists">
                Posts tab
                <p>Qui, voluptas repellat impedit ducimus earum at ad architecto consectetur perferendis aspernatur
                    iste amet ex tempora animi, illum tenetur quae assumenda iusto.</p>
            </md-tab>
        </md-tabs>
    </div>
</template>

<script>
    import SongTab from "@/components/SongTab";
    import StreamApi from "@/js/StreamApi";
    import Song from "@/js/Song";
    import ArtistTab from "../components/ArtistTab";

    export default {
        name: 'home',
        components: {
            ArtistTab,
            SongTab
        },
        props: {
            currentSong: {type: Song, required: true},
            favoritesId: {type: Number, required: true}
        },
        mounted() {
            // console.log(, this.currentSong, this.favoritesId);
        },
        methods: {
            add: function (song) {
                this.$emit('add', song);
            },
            remove: function (song) {
                this.$emit('remove', song, this.favoritesId);
            },
            playSong: async function (song, queueName) {
                this.$emit('play', song, queueName);
            },
        }
    }
</script>
<style scoped>
    #tab-songs, #tab-artists, #tab-playlists {
        padding: 0 !important;
    }
</style>
