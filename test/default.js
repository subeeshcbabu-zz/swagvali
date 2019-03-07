const Path = require('path');
const Test = require('ava');
const Parser = require('swagger-parser');
const Validators = require('../lib');
const ValidatorUtil = require('../testutils');

const api = 'https://raw.githubusercontent.com/subeeshcbabu/swaggerize-examples/master/api/petstore-full.json';
const localApi = Path.resolve(__dirname, 'fixture/petstore.json');
let path = '/pets';
let operation = 'post';
let validator;

function validateSuccess(t, validator) {
    //Mock data
    let mock = {
        id: -402127969058816,
        category: {
            id: -4945612667617280,
            name: 'utXEG'
        },
        name: 'doggie',
        photoUrls: ['KFIazYOx', 'rSAIQab'],
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
        t.falsy(resp.errors, 'No validation errors');
        //Null input
        resp = validator.call(null, null);
        t.truthy(resp.status, 'Ok validation status');
        t.falsy(resp.errors, 'No validation errors');
        //Undefined input
        resp = validator.call(null, undefined);
        t.truthy(resp.status, 'Ok validation status');
        t.falsy(resp.errors, 'No validation errors');
        //Empty input
        resp = validator.call(null, {});
        t.truthy(resp.status, 'Ok validation status');
        t.falsy(resp.errors, 'No validation errors');
        //Required check
        mock = {
            name: 'some name',
            photoUrls: []
        };
        resp = validator.call(null, mock);
        t.truthy(resp.status, 'OK validation status');
        t.falsy(resp.errors, 'No validation errors');
    });
}

Test('JOI schema Validator for path /pets and operation post', t => {

    validator = Validators(api, {
        path,
        operation,
        joischema: true
    });

    return validateSuccess(t, validator);
});

Test('JSON schema Validator for path /pets and operation post', t => {

    validator = Validators(api, {
        path,
        operation
    });

    return validateSuccess(t, validator);
});

Test('Local api file', t => {
    let parsed = Parser.validate(localApi);
    let vali = Validators(parsed, {
        validated: true
    });

    return vali.then(validators => {
        //Test /pet/findByStatus - collectionFormat- cvs - (Required = true)
        let subject = validators['/pet/findByStatus'].get.parameters[0];
        let mock;
        // Undefined data
        let result = subject.validate(mock);
        t.false(result.status, 'OK validation status');
        t.truthy(result.errors, 'OK validation errors');
        // Null data
        mock = null;
        result = subject.validate(mock);
        t.false(result.status, 'OK validation status');
        t.truthy(result.errors, 'OK validation errors');
        //Wrong data
        mock = {};
        result = subject.validate(mock);
        t.false(result.status, 'OK validation status');
        t.truthy(result.errors, 'OK validation errors');
        //Wrong data
        mock = 'abc,def';
        result = subject.validate(mock);
        t.false(result.status, 'OK validation status');
        t.truthy(result.errors, 'OK validation errors');
        //Correct data
        mock = 'available,pending';
        result = subject.validate(mock);
        t.true(result.status, 'OK validation status');
        t.falsy(result.errors, 'OK validation errors');

        //Test /pet/findByTags - collectionFormat- cvs - (Required = false)
        subject = validators['/pet/findByTags'].get.parameters[0];
        // Undefined data
        mock = undefined;
        result = subject.validate(mock);
        //If required = false, then the data can be undefined.
        t.true(result.status, 'OK validation status');
        t.falsy(result.errors, 'OK validation errors');
        mock = null;
        result = subject.validate(mock);
        //If required = false, then the data can be null.
        t.true(result.status, 'OK validation status');
        t.falsy(result.errors, 'OK validation errors');
        //Wrong data
        mock = {};
        result = subject.validate(mock);
        t.false(result.status, 'OK validation status');
        t.truthy(result.errors, 'OK validation errors');
        //Correct data
        mock = 'something,somethingelse';
        result = subject.validate(mock);
        t.true(result.status, 'OK validation status');
        t.falsy(result.errors, 'OK validation errors');

        //Test /store/order/{orderId} - integer type
        subject = validators['/store/order/{orderId}'].get.parameters[0];
        // Undefined data
        mock = undefined;
        result = subject.validate(mock);
        //If required = true, then the data cannot be undefined.
        t.false(result.status, 'OK validation status');
        t.truthy(result.errors, 'OK validation errors');
        //Wrong data
        mock = 'notanumber';
        result = subject.validate(mock);
        t.false(result.status, 'OK validation status');
        t.truthy(result.errors, 'OK validation errors');
        //wrong data
        mock = '12345';
        result = subject.validate(mock);
        t.false(result.status, 'OK validation status');
        t.truthy(result.errors, 'OK validation errors');
        //Correct data
        mock = '6'; // Should be between 0 and 10. Should be multiple of 2.
        result = subject.validate(mock);
        t.true(result.status, 'OK validation status');
        t.falsy(result.errors, 'OK validation errors');
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
