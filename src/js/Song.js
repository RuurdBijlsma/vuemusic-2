export default class Song {
    constructor(id='', title='', artist='', thumbnail='', duration=1, color='grey') {
        this.id = id;
        this.title = title;
        this.artist = artist;
        this.thumbnail = thumbnail;
        this.duration = duration;
        this.color = color;
    }

    static fromObject(data) {
        return new Song(data.id, data.title, data.artist, data.thumbnail, data.duration, data.color);
    }
}