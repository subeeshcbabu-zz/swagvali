const Test = require('ava');
const Validators = require('../lib');
const Swagmock = require('swagmock');
const Fetch = require('node-fetch');
const Co = require('co');
const Ignorelist = [
    'azure.com:arm-web',
    'citrixonline.com:scim',
    'citrixonline.com:gotomeeting',
    'bbc.com',
    'bbci.co.uk',
    'botify.com',
    'bbryiot.com',
    'firebrowse.org',
    'getsandbox.com',
    'versioneye.com',
    'gettyimages.com',
    'googleapis.com:adsense',
    'motaword.com',
    'uploady.com',
    'watchful.li'
];

const parameters = (api) => {
    return new Promise ((resolve, reject) => {
        Swagmock(api).parameters({}, (error, mock) => {
            error ? reject(error) : resolve(mock);
        });
    });
};

const validator = (api, t) => {
    return Promise.all([ Validators(api), parameters(api) ]).then(resolved => {
        const [ validators, mocks ] = resolved;
        Object.keys(validators).forEach(path => {
            let pathObj = validators[path];
            Object.keys(pathObj).forEach(operation => {
                let parameters;
                if (operation === 'parameters') {
                    return;
                }
                if (!pathObj[operation]) {
                    return;
                }
                parameters = pathObj[operation]['parameters'];
                if (!parameters) {
                    return;
                }
                for (let i = 0; i < parameters.length; i++) {

                    let param = parameters[i];
                    let paramSpec = param.parameter;
                    //Validator Function
                    let validator = param.validate;
                    //Fetch the mock
                    let mockParams = mocks[path][operation]['parameters'][paramSpec.in];
                    if (mockParams) {
                        let mockParam;
                        for (let j = 0; j < mockParams.length; j++) {
                            if (mockParams[j].name === paramSpec.name) {
                                mockParam = mockParams[j];
                            }
                        }
                        if (mockParam) {
                            let resp = validator.call(null, mockParam && mockParam.value);
                            t.truthy(resp, `${api} OK Param Validation for ${path} - ${operation} - ${paramSpec.name}`);
                            t.truthy(resp.status, `${api} OK validation status`);
                            t.is(resp.errors, null, `${api} No validation errors`);
                        }
                    }
                }
            });
        });
        return api;
    });
};

Test('real world apis', t => {
    return Co(function* () {
        let list = yield Fetch('https://s3.amazonaws.com/api.apis.guru/v2/list.json').then(res => res.json());
        let apis = Object.keys(list)
            .slice(40, 50)
            .filter((api, i) => (!Ignorelist.includes(api)))
            .map(api => {
                let versions =  Object.keys(list[api].versions);
                let lastVersion = versions[versions.length - 1];
                let swaggerUrl = list[api].versions[lastVersion].swaggerUrl;
                return validator(swaggerUrl, t);
            });

        return yield apis;
    }).then(apis => console.log(apis));
});
