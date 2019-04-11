<template>
    <div class="login">
        <h2>Login</h2>
        <md-field :class="userError?'md-invalid':''">
            <label>Username</label>
            <md-input @keydown.enter="login()" name="username" v-model="username"></md-input>
            <span class="md-error">{{userError}}}</span>
        </md-field>
        <md-field :class="passError?'md-invalid':''">
            <label>Password</label>
            <md-input @keydown.enter="login()" name="password" type="password" v-model="password"></md-input>
            <span class="md-error">{{passError}}</span>
        </md-field>
        <md-button @click="login()" class="md-accent md-raised">Login</md-button>
        <md-button @click="register()">Register</md-button>
    </div>
</template>

<script>
    import StreamApi from "@/js/StreamApi";
    import AccountManager from '@/js/AccountManager';

    export default {
        name: 'home',
        data() {
            return {
                username: '',
                password: '',
                userError: false,
                passError: false,
            };
        },
        components: {},
        props: {},
        mounted() {
        },
        methods: {
            async login() {
                let result = await AccountManager.login(this.username, this.password);
                if (result.success === true) {
                    this.redirect();
                } else {
                    this.userError = 'Login failed: incorrect username/password combination';
                }
            },
            async register() {
                let result = await AccountManager.register(this.username, this.password);
                if (result.success === true) {
                    this.redirect();
                } else {
                    this.userError = 'Register failed: username already in use';
                }
            },
            redirect() {
                let redirect = this.$route.query.redirect;
                if (redirect) {
                    location.href = redirect;
                    location.reload();
                } else {
                    location.href = location.href.replace(location.hash, '');
                    location.reload();
                }
            }
        }
    }
</script>
<style scoped>

    .login {
        text-align: center;
        padding: 30px;
    }
</style>
