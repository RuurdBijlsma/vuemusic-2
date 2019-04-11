import fs from './FileStorage';
import StreamApi from '@/js/StreamApi';

class MediaHelper {
    async getAudioSource(song) {
        let ytId = song.id;
        let fileName = ytId;
        await fs.awaitReady();
        let url;
        let exists = await fs.exists(fileName);
        if (exists)
            url = (await fs.getFileByName(fileName)).toURL();
        else {
            let cacheNow = !song.isCaching;
            if (cacheNow)
                song.isCaching = true;
            url = await StreamApi.getStreamUrl(ytId);
            if (cacheNow)
                setTimeout(() => this.cacheSongLocally(song, url), 500);

        }

        console.log(url);
        return url;
    }

    async cacheSongLocallyIfNeeded(song) {
        let ytId = song.id;
        if (!await fs.exists(ytId))
            await this.cacheSongLocally(song);
    }

    async cacheSongLocally(song, url) {
        let ytId = song.id;
        console.log("Caching song", song.title);
        let response = await fetch(url);
        let audioBlob = await response.blob();

        let result = await fs.createFileFromBlob(ytId, audioBlob);
        console.log("Cache complete", song.title, result);
        song.isCaching = false;
        song.isCached = true;
    }

    async checkSongsCacheStatus(songs) {
        await fs.awaitReady();
        let tasks = songs.map(s => fs.exists(s.id));

        let results = await Promise.all(tasks);

        for (let i = 0; i < results.length; i++)
            songs[i].isCached = results[i];
    }
}

export default new

MediaHelper();