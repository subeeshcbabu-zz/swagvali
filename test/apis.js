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
    'motaword.com',//Parser validation issues
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
                                console.log(`validation error for ` , result.title);
                                console.log(`input:`, mockParam && mockParam.value);
                                console.log(`schema: `, paramSpec);
                                console.log(resp.errors);
                            }
                            t.truthy(resp, `${api} OK Param Validation for ${path} - ${operation} - ${paramSpec.name}`);
                            t.truthy(resp.status, `${api} OK validation status`);
                            t.is(resp.errors, null, `${api} No validation errors`);

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
        console.log(" APIs: ");
        let apis = Object.keys(list)
            .slice(40, 80)
            .filter((api, i) => (!Ignorelist.includes(api)))
            .map(api => {
                let versions =  Object.keys(list[api].versions);
                let lastVersion = versions[versions.length - 1];
                let swaggerUrl = list[api].versions[lastVersion].swaggerUrl;
                console.log(swaggerUrl);
                return Parser.validate(swaggerUrl);
            });

        let apiObjs = yield apis;
        console.log(" Validating APIs ");
        return yield apiObjs.map(api => validator(api, t));
    }).then(result => console.log(result));
});
