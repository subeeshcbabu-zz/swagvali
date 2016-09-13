const Test = require('ava');
const Validators = require('../lib');
const Swagmock = require('swagmock');
const Parser = require('swagger-parser');
const Fetch = require('node-fetch');
const Co = require('co');
const Ignorelist = [
    'azure.com:arm-web',
    'bbc.com',
    'bbci.co.uk',
    'bbryiot.com',
    'citrixonline.com:scim', //Parser validation issues
    'firebrowse.org',//Wrong enum values with format=date
    'getsandbox.com',//`is-my-json-valid` fails to create a validator(Out of memory)
    'gettyimages.com', //Wrong enum definition. enum as a type=array
    'github.com', //Missing type=string for enums
    'googleapis.com:adsense',//Parser validation issues
    'googleapis.com:consumersurveys',//`is-my-json-valid` fails to create a validator(Out of memory)
    'googleapis.com:dataflow',
    'googleapis.com:datastore',
    'googleapis.com:gmail',
    'googleapis.com:servicemanagement',
    'googleapis.com:tagmanager',
    'jirafe.com',//Max range for numbers
    'motaword.com',//Parser validation issues
    'patientview.org',//`is-my-json-valid` fails to create a validator(Out of memory)
    'pushpay.com',//`is-my-json-valid` fails to create a validator(Out of memory)
    'rebilly.com',//wrong items def for type array
    'simplyrets.com',//Wrong enum definition. enum as a type=array
    'stackexchange.com',// Wrong enum definition. type=string, but enum has boolean values
    'uploady.com',//Parser validation issues
    'versioneye.com',//Parser validation issues
    'watchful.li'//Parser validation issues
];

const validator = (api, t) => {

    return Promise.all([
        Validators(api, { validated: true }),
        Swagmock(api, { validated : true }).parameters({})
    ]).then(resolved => {
        const [ validators, mocks ] = resolved;
        let result = {
            title: api.info.title,
            errors: []
        };
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
                            if (resp && resp.errors && resp.errors.length > 0) {
                                result.errors.push(resp.errors);
                                /* eslint-disable no-console */
                                console.log('validation error for ' , result.title);
                                console.log('input:', mockParam && mockParam.value);
                                console.log('schema: ', paramSpec);
                                console.log(resp.errors);
                                /* eslint-disable no-console */
                            }
                            t.truthy(resp, `${api} OK Param Validation for ${path} - ${operation} - ${paramSpec.name}`);
                            t.truthy(resp.status, `${api} OK validation status`);
                            t.falsy(resp.errors, `${api} No validation errors`);

                        }
                    }
                }
            });
        });
        return result;
    });
};

Test('real world apis', t => {
    return Co(function* () {
        let list = yield Fetch('https://s3.amazonaws.com/api.apis.guru/v2/list.json').then(res => res.json());
        /* eslint-disable no-console */
        console.log('APIs: ' );
        /* eslint-disable no-console */
        let apis = Object.keys(list)
            .slice(200)
            .filter((api) => (!Ignorelist.includes(api)))
            .map(api => {
                let versions =  Object.keys(list[api].versions);
                let lastVersion = versions[versions.length - 1];
                let swaggerUrl = list[api].versions[lastVersion].swaggerUrl;
                /* eslint-disable no-console */
                console.log(swaggerUrl);
                /* eslint-disable no-console */
                return Parser.validate(swaggerUrl);
            });

        let apiObjs = yield apis;
        /* eslint-disable no-console */
        console.log('Validating APIs... ');
        /* eslint-disable no-console */
        return yield apiObjs.map(api => validator(api, t));
    }).then(result => console.log(result));
});
