import CustomApi from './CustomApi';
import Song from './Song';

class StreamApi extends CustomApi {
    constructor() {
        super('');
        if (localStorage.getItem('user') !== null)
            this.user = JSON.parse(localStorage.user);
        else this.user = {user: '', password: ''};
    }

    get hasUser() {
        return this.user.hasOwnProperty('user') && this.user.user !== '';
    }

    async post(body, ...route) {
        if (!this.hasUser)
            console.warn("Client intercept: not logged in");
        let result = await super.post(body, ...route);
        if (result.hasOwnProperty('status') && result.status === 'not logged in')
            console.warn('SERVER: ', result);
        return result;
    }

    setServer(server) {
        this.baseUrl = server;
    }

    async login(username, password) {
        return await this.post({user: username, password}, 'login');
    }

    async register(username, password) {
        return await this.post({user: username, password}, 'register');
    }

    async search(query) {
        let songs = await this.post(this.user, 'search', query);
        return songs.map(s => Song.fromObject(s));
    }

    async playlists() {
        return await this.post(this.user, 'playlists');
    }

    async createPlaylist(playlistName) {
        return await this.post(this.user, 'createPlaylist', playlistName);
    }

    async deletePlaylist(playlistId) {
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

export default new StreamApi();