import fs from './FileStorage';
import Song from "@/js/Song";

class MediaHelper {
    async getAudioSource(api, ytId) {
        let fileName = ytId;
        await fs.awaitReady();
        let url;
        let exists = await fs.exists(fileName);
        if (exists)
            url = (await fs.getFileByName(fileName)).toURL();
        else
            url = await api.getStreamUrl(ytId);

        console.log(url);
        return url;
    }

    async cacheSongLocallyIfNeeded(api, song) {
        let ytId = song.id;
        if (!await fs.exists(ytId))
            await this.cacheSongLocally(api, song);
    }

    async cacheSongLocally(api, song) {
        song.isCaching = true;
        let ytId = song.id;
        console.log("Caching song", song.id);
        let url = await api.getStreamUrl(ytId);
        let response = await fetch(url);
        let audioBlob = await response.blob();

        let result = await fs.createFileFromBlob(ytId, audioBlob);
        console.log("Cache complete", result);
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

export default new MediaHelper();