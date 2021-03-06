import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Search from "@/views/Search";
import Playlist from "@/views/Playlist";
import Login from "./views/Login";
import Artist from "./views/Artist";

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'root',
            component: Home,
            props: true
        },
        {
            path: '/home/:tab?',
            name: 'home',
            component: Home,
            props: true
        },
        {
            path: '/search/:query?',
            name: 'search',
            component: Search
        },
        {
            path: '/playlist/:userName/:playlistName',
            name: 'playlist',
            component: Playlist
        },
        {
            path: '/artist/:artistName',
            name: 'artist',
            component: Artist
        },
        {
            path: '/login',
            name: 'login',
            component: Login
        }
    ]
})
