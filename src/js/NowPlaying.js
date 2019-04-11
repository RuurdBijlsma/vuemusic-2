import Utils from '@/js/Utils';

class NowPlaying {
    constructor() {
        this.playlistQueues = {
            favorites: {
                update: () => {
                },
                songs: [],
                shuffledSongs: [],
            },
            search: {
                update: () => {
                },
                songs: [],
                shuffledSongs: [],
            },
        };
        this.queueName = localStorage.getItem('lastQueue') === null ? 'favorites' : localStorage.lastQueue;
    }

    setQueue(playlist, songs, update) {
        this.playlistQueues[playlist].songs = songs;
        this.playlistQueues[playlist].update = update;
        this.playlistQueues[playlist].shuffledSongs = Utils.shuffle([...songs]);
        console.log(this.playlistQueues[playlist]);
    }

    reshuffle(playlist) {
        this.playlistQueues[playlist].shuffledSongs = Utils.shuffle([...this.playlistQueues[playlist].songs]);
    }

    get queue() {
        //todo queuename als dat een playlist is ofzo
        return this.playlistQueues[this.queueName];
    }

    set queueName(value) {
        console.log("Queue name is now", value);
        this._queueName = value;
        localStorage.lastQueue = value;
    }

    get queueName() {
        return this._queueName;
    }
}

export default new NowPlaying();