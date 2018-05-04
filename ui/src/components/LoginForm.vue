<template>
    <div>
        <h3>Login to Flux UI</h3>
        <div id="form-group">
            <label>
                Email:
                <input v-model.trim="user.email" placeholder="name@example.com" type="email" name="email"/>
            </label>

            <button v-show="show.checkEmailButton" v-on:click="checkEmail()">Continue</button>

            <Loading :config="loading"></Loading>
        </div>
    </div>
</template>

<script>
    import Loading from "./Loading";
    import api from '../lib/api.ts';

    export default {
        name: "LoginForm",
        components: {Loading},
        data: () => ({
            show: {
                checkEmailButton: true,
            },
            loading: {
                msg: "",
                isLoading: false
            },
            user: {
                email: ""
            }
        }),

        methods: {
            checkEmail() {
                this.show.checkEmailButton = false;
                this.showLoading("Checking Email...");

                console.log(this);
                this.$flux.login.checkEmail({email: this.user.email})
                    .then(r => {
                        this.show.checkEmailButton = true;
                        this.hideLoading();
                        r.caseOf({
                            left: this.showErr,
                            right: ({doOnboarding}) => {
                                if (doOnboarding) {
                                    this.doOnboarding();
                                } else {
                                    this.doNormalLogin();
                                }
                            }
                        })
                    })
            },

            showLoading(msg) {
                this.loading.msg = msg;
                this.loading.isLoading = true;
            },

            hideLoading() {
                this.loading.msg = "";
                this.loading.isLoading = false;
            },

            showErr(msg) {
                console.log("Showing error:", msg);
                this.$notify({
                    title: "Error",
                    text: msg,
                    type: 'error'
                })
            }
        }
    }
</script>

<style scoped>

</style>