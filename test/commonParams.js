const Tape = require('tape');
const Validators = require('../lib');
const Swagmock = require('swagmock');

Tape('Common Parameters', t => {

    let api = 'https://raw.githubusercontent.com/subeeshcbabu/swaggerize-examples/master/api/google-analytics.json';
    let validators;
    let mockgen = Swagmock(api);

    /**
     * Postive test case: All the paths
     */
    t.test('Validate merged parameters', assert => {
        let path = '/data';
        let operation = 'get';
        validators = Validators({
            api,
            path,
            operation
        });
        validators
            .then(res => {
                /**
                 * Validate response
                 */
                mockgen.parameters({path, operation}, function (error, mock) {
                    let parameters = res;

                    if (!parameters) {
                        return;
                    }
                    for (let i = 0; i < parameters.length; i++) {

                        let param = parameters[i];
                        let paramSpec = param.parameter;
                        //Validator Function
                        let validator = param.validator;
                        //Fetch the mock
                        let mockParams = mock['parameters'][paramSpec.in];
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
                    assert.end();
                });
            })
            .catch(err => {
                assert.error(err);
                assert.end();
            });
    });

});
