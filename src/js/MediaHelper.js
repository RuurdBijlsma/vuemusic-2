import fs from './FileStorage';
import StreamApi from '@/js/StreamApi';

class MediaHelper {
    constructor() {
        this.songStatuses = [];
        console.log(fs);
    }

    setCachingStatus(song, value) {
        song.isCaching = value;
        if (!this.songStatuses.hasOwnProperty(song.id)) {
            this.songStatuses[song.id] = {isCaching: false, isCached: true}
        }
        this.songStatuses[song.id].isCaching = value;
    }

    setCachedStatus(song, value) {
        song.isCached = value;
        if (!this.songStatuses.hasOwnProperty(song.id)) {
            this.songStatuses[song.id] = {isCaching: false, isCached: true}
        }
        this.songStatuses[song.id].isCached = value;
    }

    async getAudioSource(song) {
        let ytId = song.id;
        let fileName = ytId;
        await fs.awaitReady();
        let url;
        let exists = await fs.exists(fileName);
        if (exists)
            url = (await fs.getFileByName(fileName)).toURL();
        else {
            let cacheNow = !this.isSongCaching(song);
            if (cacheNow)
                this.setCachingStatus(song, true);
            url = await StreamApi.getStreamUrl(ytId);
            if (cacheNow) {
                setTimeout(() => this.cacheSongLocally(song, url), 500);
            } else {
                console.log("Not caching", song.title, 'already in progress', this.isSongCaching(song));
            }
        }

        console.log(url);
        return url;
    }

    isSongCaching(song) {
        if (this.songStatuses.hasOwnProperty(song.id))
            return this.songStatuses[song.id].isCaching;
        return false;
    }

    async cacheSongLocallyIfNeeded(song) {
        let ytId = song.id;
        if (!this.isSongCaching(song) && !await fs.exists(ytId)) {
            this.setCachingStatus(song, true);
            let url = await StreamApi.getStreamUrl(ytId);
            await this.cacheSongLocally(song, url);
        }
    }

    async cacheSongLocally(song, url) {
        let ytId = song.id;
        console.log("Caching song", song.title, url);
        let blob;
        try {
            let response = await fetch(url);
            blob = await response.blob();
            console.log('song cache blob', blob);
        } catch (e) {
            console.warn("Could not fetch", url, e);
        }

        if (blob && blob.size > 0) {
            let result = await fs.createFileFromBlob(ytId, blob);
            console.log("Cache complete", song.title, result);
            this.setCachedStatus(song, true);
        } else {
            this.setCachedStatus(song, false, {blob});
        }
        this.setCachingStatus(song, false);
    }

    async checkSongsCacheStatus(songs) {
        await fs.awaitReady();
        let tasks = songs.map(s => fs.exists(s.id));

        let results = await Promise.all(tasks);

        for (let i = 0; i < results.length; i++)
            songs[i].isCached = results[i];

        for (let song of songs)
            if (this.songStatuses.hasOwnProperty(song.id))
                song.isCaching = this.songStatuses[song.id].isCaching;
    }
}

export default new MediaHelper();
