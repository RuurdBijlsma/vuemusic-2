import StreamApi from '@/js/StreamApi';

class AccountManager {
    constructor() {
    }

    get isLoggedIn() {
        return StreamApi.hasUser;
    }

    async login(username, password) {
        let hash = await this.hash(password);
        let result = await StreamApi.login(username, hash);
        if (result.success === true)
            localStorage.user = JSON.stringify({user: username, password: hash});
        StreamApi.user = {user: username, password: hash};
        return result;
    }

    async logout() {
        StreamApi.user = {user: '', password: ''};
        localStorage.clear();
    }

    async register(username, password) {
        let hash = await this.hash(password);
        let result = await StreamApi.register(username, hash);
        console.log("register result: ", result);
        StreamApi.user = {user: username, password: hash};
        return result;
    }

    async hash(value, algorithm = 'SHA-256') {
        value += 'xxTsC/JoZp0oo3dTaXrWswe3cOIi4GBsRPh0F6SVKww8q2I01uQI3gmYVq6RU9A4l9YkQ8W';
        let buffer = await crypto.subtle.digest(algorithm, new TextEncoder().encode(value));
        return btoa(new Uint8Array(buffer).reduce((s, b) => s + String.fromCharCode(b), ''));
    }
}

export default new AccountManager();