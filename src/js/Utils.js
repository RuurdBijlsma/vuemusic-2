
class Utils {
    secondsToHms(seconds) {
        seconds = Math.round(seconds);
        if (seconds < 60)
            return '0:' + seconds.toString().padStart(2, '0');
        if (seconds < 60 * 60)
            return Math.floor(seconds / 60) + ':' + (seconds % 60).toString().padStart(2, '0');
        let h = Math.floor(seconds / 60 / 60);
        let m = Math.floor((seconds % 60) / 60).toString().padStart(2, '0');
        let s = Math.floor(seconds % (60 * 60)).toString().padStart(2, '0');
        return `${h}:${m}:${s}`
    }

    shuffle(array){
        let m = array.length, t, i;
        // While there remain elements to shuffle…
        while (m) {
            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);
            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }

        return array;
    }
}

export default new Utils;