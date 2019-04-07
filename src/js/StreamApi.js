import CustomApi from './CustomApi';
import Song from './Song';

export default class StreamApi extends CustomApi {
    constructor(server) {
        super(server);

        this.user = {
            user: 'defaultuser',
            password: 'T1DSf3FVuf1RHy1fu0TdSRWGt3zb/xwRBHSJiz8Zh8I='
        }
    }

    async hash(value, algorithm = 'SHA-256') {
        let buffer = await crypto.subtle.digest(algorithm, new TextEncoder().encode(value));
        return btoa(new Uint8Array(buffer).reduce((s, b) => s + String.fromCharCode(b), ''));
    }

    async register() {
        let success = await this.post(this.user, 'register', query);
        return success;
    }

    async search(query) {
        let songs = await this.post(this.user, 'search', query);
        return songs.map(s => Song.fromObject(s));
    }

    async playlists(){
        return await this.post(this.user, 'playlists');
    }

    async createPlaylist(playlistName){
        return await this.post(this.user, 'createPlaylist', playlistName);
    }

    async deletePlaylist(playlistId){
        return await this.post(this.user, 'deletePlaylist', playlistId);
    }

    async songs(playlistId) {
        let songs = await this.post(this.user, 'songs', playlistId);
        return songs.map(s => Song.fromObject(s));
    }

    async favorites() {
        let songs = await this.post(this.user, 'favorites');
        return songs.map(s => Song.fromObject(s));
    }

    async save(ytId, playlistId) {
        return await this.post(this.user, 'save', ytId, playlistId);
    }

    async remove(ytId, playlistId) {
        return await this.post(this.user, 'remove', ytId, playlistId);
    }

    async info(ytId) {
        return await this.post(this.user, 'info', ytId);
    }

    async getStreamUrl(ytId) {
        let url = (await this.info(ytId)).url;
        return this.baseUrl + '/pipe/' + encodeURIComponent(url);
    }
}