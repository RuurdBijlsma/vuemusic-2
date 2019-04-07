export default class CustomApi {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async request(method, params, body) {
        let response = await fetch(this.baseUrl + '/' + params.join('/'), {
            method,
            headers: {
                "Content-Type": "application/json",
                // "Content-Type": "application/x-www-form-urlencoded",
            },
            body: JSON.stringify(body)
        });
        return await response.json();
    }

    async get(...params) {
        return await this.request('get', params, {});
    }

    async post(body, ...params) {
        console.info('[POST]', params, body);
        return await this.request('post', params, body);
    }
}