const Test = require('ava');
const ValidatorUtil = require('../testutils');
const Parser = require('swagger-parser');
const Fetch = require('node-fetch');
const Co = require('co');
const Ignorelist = require('../testutils/ignorelist');
const ApiRegistry = 'https://s3.amazonaws.com/api.apis.guru/v2/list.json';

Test('real world apis', t => {
    let apiCount = 0;
    return Co(function* () {
        let list = yield Fetch(ApiRegistry).then(res => res.json());
        let apis = Object.keys(list)
            .slice(210, 220)
            .filter((api) => (!Ignorelist.includes(api)))
            .map(api => {
                let versions =  Object.keys(list[api].versions);
                let lastVersion = versions[versions.length - 1];
                let swaggerUrl = list[api].versions[lastVersion].swaggerUrl;
                apiCount++;
                return Parser.validate(swaggerUrl);
            });

        let apiObjs = yield apis;
        /* eslint-disable no-console */
        console.log(`Validating ${apiCount} APIs... `);
        /* eslint-disable no-console */
        return yield apiObjs.map(api => ValidatorUtil(api, t));
    }).then(result => console.log(result));
});
