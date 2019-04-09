class NowPlaying {
    constructor() {
        this.playlistQueues = {
            favorites:{
                update:()=>{},
                songs:[]
            },
            search:{
                update:()=>{},
                songs:[]
            },
        };
        this.queueName = localStorage.getItem('lastQueue') === null ? 'favorites' : localStorage.lastQueue;
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