const Validators = require('../lib');
const Swagmock = require('swagmock');

const validator = (api, t) => {

    return Promise.all([
        Validators(api, { validated: true }),
        Swagmock(api, { validated : true }).parameters({})
    ]).then(resolved => {
        const [ validators, mocks ] = resolved;
        let result = {
            title: api.info && api.info.title,
            errors: []
        };
        Object.keys(validators).forEach(path => {
            let pathObj = validators[path];
            Object.keys(pathObj).forEach(operation => {
                let parameters;
                if (operation === 'parameters' || !pathObj[operation]) {
                    return;
                }
                parameters = pathObj[operation]['parameters'];
                if (!parameters) {
                    return;
                }
                for (let i = 0; i < parameters.length; i++) {

                    let param = parameters[i];
                    let paramSpec = param.spec;
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

module.exports = validator;
