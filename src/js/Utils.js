 class Utils{
    secondsToHms(seconds){
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
}
export default new Utils;