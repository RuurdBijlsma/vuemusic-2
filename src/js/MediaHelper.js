import fs from './FileStorage';

class MediaHelper {
    async getAudioSource(api, ytId) {
        let fileName = ytId + '.weba';
        await fs.awaitReady();
        let url;
        if (await fs.exists(fileName))
            url = (await fs.getFileByName(fileName)).toURL();
        else
            url = await api.getStreamUrl(ytId);

        return url;
    }

    async cacheSongLocallyIfNeeded(api, ytId) {
        if (!await fs.exists(ytId + '.weba'))
            await this.cacheSongLocally(api, ytId);
    }

    async cacheSongLocally(api, ytId) {
        console.log("Caching song");
        let url = await api.getStreamUrl(ytId);
        let response = await fetch(url);
        let audioBlob = await response.blob();
        console.log("Download complete", audioBlob);

        let result = await fs.createFileFromBlob(ytId + '.weba', audioBlob);
        console.log("Cache complete", result);
    }
}

export default new MediaHelper();