const Test = require('ava');
const Validators = require('../lib');
const Swagmock = require('swagmock');

let api = 'https://raw.githubusercontent.com/subeeshcbabu/swaggerize-examples/master/api/google-analytics.json';
let mockgen = Swagmock(api);

/**
 * Postive test case: All the paths
 */
Test('Validate merged parameters', t => {
    let path = '/data';
    let operation = 'get';

    return Validators(api, {
        path,
        operation
    }).then(res => {
        /**
         * Validate response
         */
        return mockgen.parameters({ path, operation })
            .then(mock => {
                let parameters = res.parameters;

                if (!parameters) {
                    return;
                }

                for (let i = 0; i < parameters.length; i++) {

                    let param = parameters[i];
                    let paramSpec = param.spec;
                    //Validator Function
                    let validator = param.validate;
                    //Fetch the mock
                    let mockParams = mock['parameters'][paramSpec.in];
                    let mockParam;
                    for (let j = 0; j < mockParams.length; j++) {
                        if (mockParams[j].name === paramSpec.name) {
                            mockParam = mockParams[j];
                        }
                    }

                    let resp = validator.call(null, mockParam && mockParam.value);
                    t.truthy(resp, `OK Param Validation for ${path} - ${operation} - ${paramSpec.name}`);
                    t.truthy(resp.status, 'OK validation status');
                    t.falsy(resp.errors, 'No validation errors');
                }
            });
    });
});
