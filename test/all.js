const Tape = require('tape');
const Validators = require('../lib');
const Swagmock = require('swagmock');

Tape('Validators for all the paths', t => {

    let api = 'https://raw.githubusercontent.com/subeeshcbabu/swaggerize-examples/master/api/petstore-full.json';
    let validators;
    let mockgen = Swagmock(api);


    /**
     * Postive test case: All the paths
     */
    t.test('Validation for all paths', assert => {
        validators = Validators({
            api
        });
        validators
            .then(res => {
                /**
                 * Validate response
                 */
                mockgen.parameters({}, function (error, mock) {
                    Object.keys(res).forEach(path => {
                        Object.keys(res[path]).forEach(operation => {
                            let parameters = res[path][operation]['parameters'];
                            if (!parameters) {
                                return;
                            }
                            for (let i = 0; i < parameters.length; i++) {

                                let param = parameters[i];
                                let paramSpec = param.parameter;
                                //Validator Function
                                let validator = param.validator;
                                //Fetch the mock
                                let mockParams = mock[path][operation]['parameters'][paramSpec.in];
                                let mockParam;
                                for (let j = 0; j < mockParams.length; j++) {
                                    if (mockParams[j].name === paramSpec.name) {
                                        mockParam = mockParams[j];
                                    }
                                }
                                let resp = validator.call(null, mockParam && mockParam.value);
                                assert.ok(resp, `OK Param Validation for ${path} - ${operation} - ${paramSpec.name}`);
                                assert.ok(resp.status, 'OK validation status');
                                assert.error(resp.errors, 'No validation errors');
                            }
                        });
                    });
                    assert.end();
                });
            })
            .catch(err => {
                assert.error(err);
                assert.end();
            });
    });

    
});
