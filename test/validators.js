const Tape = require('tape');
const Validators = require('../lib');
const Swagmock = require('swagmock');

Tape('Validators', t => {

    let api = 'https://raw.githubusercontent.com/subeeshcbabu/swaggerize-examples/master/api/petstore-full.json';
    let validators;
    let mockgen = Swagmock(api);

    /**
     * Postive test case: Default: for path /pets and operation post
     */
    t.test('Validation for path /pets and operation post', assert => {
        let path = '/pets';
        let operation = 'post';
        //Mock data
        let mock = {
            id: -402127969058816,
            category: {
                id: -4945612667617280,
                name: 'utXEG'
            },
            name: 'doggie',
            photoUrls: [ 'KFIazYOx', 'rSAIQab' ],
            tags: [ {
                id: -8756358623002624,
                name: 'iWD'
            },
            {
                id: -2362820784029696,
                name: 'BpzO'
            } ],
            status: 'TFcPSI'
        };

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
                let param = res[0];
                //Validator Function
                let validator = param.validator;
                let resp = validator.call(null, mock);
                assert.ok(resp, `OK Param Validation for ${path} - ${operation} - body`);
                assert.ok(resp.status, `OK validation status`);
                assert.error(resp.errors, `No validation errors`);
                assert.end();
            })
            .catch(err => {
                assert.error(err);
                assert.end();
            });
    });
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
                            let parameters = res[path][operation];
                            for (var i = 0; i < parameters.length; i++) {

                                let param = parameters[i];
                                let paramSpec = param.parameter;
                                //Validator Function
                                let validator = param.validator;
                                //Fetch the mock
                                let mockParams = mock[path][operation]['parameters'][paramSpec.in];
                                let mockParam;
                                for (var i = 0; i < mockParams.length; i++) {
                                    if (mockParams[i].name === paramSpec.name) {
                                        mockParam = mockParams[i];
                                    }
                                }
                                let resp = validator.call(null, mockParam && mockParam.value);
                                assert.ok(resp, `OK Param Validation for ${path} - ${operation} - ${paramSpec.name}`);
                                assert.ok(resp.status, `OK validation status`);
                                assert.error(resp.errors, `No validation errors`);
                            }
                        })
                    });
                    assert.end();
                });
            })
            .catch(err => {
                assert.error(err);
                assert.end();
            });
    });

    /**
     * Negative test case: for path /pets and operation post
     */
    t.test('Wrong input validation for path /pets and operation post', assert => {
        let path = '/pets';
        let operation = 'post';

        validators = Validators({
            api,
            path,
            operation
        });
        validators
            .then(res => {

                let param = res[0];
                //Validator Function
                let validator = param.validator;
                //Empty input
                let resp = validator.call(null, {});
                assert.notOk(resp.status, `false validation status`);
                assert.ok(resp.errors, `OK validation errors`);
                //Required check
                let mock = {
                    id: -402127969058816,
                    category: {
                        id: -4945612667617280,
                        name: 'utXEG'
                    }
                };
                resp = validator.call(null, mock);
                assert.notOk(resp.status, `false validation status`);
                assert.ok(resp.errors, `OK validation errors`);

                //Required check
                mock = {
                    name: 'some name',
                    photoUrls: []
                };
                resp = validator.call(null, mock);
                assert.ok(resp.status, `OK validation status`);
                assert.error(resp.errors, `No validation errors`);

                assert.end();

            })
            .catch(err => {
                assert.error(err);
                assert.end();
            });
    });

    /**
     * Negative test case: No api
     */
    t.test('no api', assert => {
        validators = Validators({});
        validators
            .catch(err => {
                assert.ok(err);
                assert.comment(err);
                assert.end();
            });
    });
    /**
     * Negative test case: wrong api
     */
    t.test('wrong api', assert => {
        validators = Validators({
            api: 'wrong api'
        });
        validators
            .catch(err => {
                assert.ok(err);
                assert.comment(err);
                assert.end();
            });
    });

    /**
     * Negative test case: wrong path
     */
    t.test('wrong path', assert => {
        validators = Validators({
            api,
            path: 'wrongpath'
        });
        validators
            .catch(err => {
                assert.ok(err);
                assert.comment(err);
                assert.end();
            });
    });
});
