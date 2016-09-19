const Test = require('ava');
const Parser = require('swagger-parser');
const Validators = require('../lib');
const ValidatorUtil = require('../testutils');

const api = 'https://raw.githubusercontent.com/subeeshcbabu/swaggerize-examples/master/api/petstore-full.json';
let path = '/pets';
let operation = 'post';
let validator;

Test('Validator for path /pets and operation post', () => {
    validator = Validators(api, {
        path,
        operation
    });
    return validator;
});

Test('Validation for path /pets and operation post', t => {

    //Mock data
    let mock = {
        id: -402127969058816,
        category: {
            id: -4945612667617280,
            name: 'utXEG'
        },
        name: 'doggie',
        photoUrls: [ 'KFIazYOx', 'rSAIQab' ],
        tags: [
            {
                id: -8756358623002624,
                name: 'iWD'
            },
            {
                id: -2362820784029696,
                name: 'BpzO'
            }
        ],
        status: 'TFcPSI'
    };

    return validator.then(res => {
        /**
         * Validate response
         */
        let param = res.parameters[0];
        //Validator Function
        let validator = param.validate;
        let resp = validator.call(null, mock);
        t.truthy(resp, `OK Param Validation for ${path} - ${operation} - body`);
        t.truthy(resp.status, 'OK validation status');
        t.ifError(resp.errors, 'No validation errors');
        //Null input
        resp = validator.call(null, null);
        t.truthy(resp.status, 'Ok validation status');
        t.ifError(resp.errors, 'No validation errors');
        //Undefined input
        resp = validator.call(null, undefined);
        t.truthy(resp.status, 'Ok validation status');
        t.ifError(resp.errors, 'No validation errors');
        //Empty input
        resp = validator.call(null, {});
        t.truthy(resp.status, 'Ok validation status');
        t.ifError(resp.errors, 'No validation errors');
        //Required check
        mock = {
            name: 'some name',
            photoUrls: []
        };
        resp = validator.call(null, mock);
        t.truthy(resp.status, 'OK validation status');
        t.ifError(resp.errors, 'No validation errors');
    });

});

/**
 * Negative test case: for path /pets and operation post
 */
Test('Wrong input validation for path /pets and operation post', t => {

    return validator.then(res => {
        let param = res.parameters[0];
        //Validator Function
        let validator = param.validate;
        //Required check
        let mock = {
            id: -402127969058816,
            category: {
                id: -4945612667617280,
                name: 'utXEG'
            }
        };
        let resp = validator.call(null, mock);
        t.false(resp.status, 'OK validation status');
        t.truthy(resp.errors, 'OK validation errors');

        //false input
        resp = validator.call(null, false);
        t.falsy(resp.status, 'OK validation status');
        t.truthy(resp.errors, 'OK validation errors');

        //true input
        resp = validator.call(null, true);
        t.falsy(resp.status, 'OK validation status');
        t.truthy(resp.errors, 'OK validation errors');

    });
});

/**
 * Negative test case: No api
 */
Test('no api', t => {
    return Validators().catch(err => {
        t.truthy(err);
    });
});
/**
 * Negative test case: wrong api
 */
Test('wrong api', t => {
    return Validators('wrong api', {}).catch(err => {
        t.truthy(err);
    });
});

/**
 * Negative test case: wrong path
 */
Test('wrong path', t => {
    return Validators(api, {
        path: 'wrongpath'
    }).catch(err => {
        t.truthy(err);
    });
});

/**
 * Negative test case: wrong operation
 */
Test('wrong operation', t => {
    return Validators(api, {
        path,
        operation: 'wrong operation'
    }).catch(err => {
        t.truthy(err);
    });
});

Test('Validators for all the paths', t => {

    return ValidatorUtil(Parser.validate(api), t);
});
