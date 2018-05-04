// all api calls should be written up as methods here (where the methods take the correct arguments)


import {Maybe, Either} from 'tsmonad';


type CheckEmailResp = {
    doOnboarding: boolean
}

type R<r> = Either<string, r>


const mkResp = (data) => {
    if (data.status == 200) {
        if (data.body.error === undefined) {
            return Either.right(data.body);
        } else {
            return Either.left(data.body.error);
        }
    } else {
        return Either.left(`HTTP request failed with status: ${data.status}`);
    }
};


const mkErr = path => err => {
    console.log('Flux api got error', err);
    return Either.left(`Request error at ${path}: ${err.status}`);
}


const FluxApi = {
    install(Vue, options) {

        const _api = (_path: string) => {
            let root;
            if (Vue.$dev) {
                root = "https://dev.api.flux.party/";
            } else {
                root = "https://api.flux.party/";
            }
            return root + _path;
        }

        const post = (_path, data) => {
            const url = _api(_path);
            return Vue.http.post(url, data).then(mkResp, mkErr(_path));
        }

        Vue.prototype.$flux = {
            login: {
                checkEmail({email}): R<CheckEmailResp> {
                    return post('user/check_email', {email})
                }
            }
        };
    }

}


export default FluxApi;
