# swagvali
A module to build validators for Swagger(OpenApi) Request parameters and Response objects.

[![Tested on APIs.guru](http://api.apis.guru/badges/tested_on.svg)](https://APIs.guru)

`Swagvali` uses [is-my-json-valid](https://github.com/mafintosh/is-my-json-valid) JSON schema validator as the default validation tool. However, [Joi](https://github.com/hapijs/joi) schema validator can be used instead of the json schema validator, by setting the option `joischema`.

## Install

```
npm i swagvali
```

## Usage

```javascript
    const Swagvali = require('swagvali');
    const api = 'http://petstore.swagger.io/v2/swagger.json';
    Swagvali(api);
```

Promise response:

```javascript
    Swagvali(api, {
        path: '/pet/findByStatus',
        operation: 'get'
    }).then(validators => {
        //Parameter validator --> validators.parameters.
        validators.parameters.forEach(validator => {
            //Parameter spec --> validator.spec.
            //Validator function --> validator.validate
        });
        //Response validator --> validators.responses.
        Object.keys(validators.responses).forEach(response => {
            //Response spec --> validators.responses[response].spec.
            //Validator function --> validators.responses[response].validate
        });
    }).catch(error => {
        //Fail on error.
        Assert.ifError(error);
    });
```

Callback style:

```javascript
    Swagvali(api, {
        path: '/pet/findByStatus',
        operation: 'get'
    }, (error, validators) => {
        //Fail on error.
        Assert.ifError(error);
        //Parameter validator --> validators.parameters.
        validators.parameters.forEach(validator => {
            //Parameter spec --> validator.spec.
            //Validator function --> validator.validate
        });
        //Response validator --> validators.responses.
        Object.keys(validators.responses).forEach(response => {
            //Response spec --> validators.responses[response].spec.
            //Validator function --> validators.responses[response].validate
        });
    });
```

## API

`Swagvali(api, [options], [cb])`

* `api` - (*Object*) or (*String*) or (*Promise*) - (required) - api can be one of the following.
    - A relative or absolute path to the Swagger api document.
    - A URL of the Swagger api document.
    - The swagger api Object
    - A promise (or a `thenable`) that resolves to the swagger api Object

* `options` - (*Object*) - (optional) - Additional options to create the mock generator.
    - `validated` -  Set this property to `true` if the api is already validated against swagger schema and already dereferenced all the `$ref`. This is really useful to generate validators for parsed api specs. Default value for this is `false` and the api will be validated using [swagger-parser validate](https://github.com/BigstickCarpet/swagger-parser/blob/master/docs/swagger-parser.md#validateapi-options-callback).
    - `path` - (*String*) - (optional) - The path for which the validators need to be generated. For example `/pet/findByStatus`, `/pet` etc. If a `path` is not specified, validators will be generated for all the paths defined by the swagger api. If you are setting a `path` option, you should set an `operation` as well.
    - `operation` - (*String*) - (optional) - The operation for which the validators need to be generated. For example `get`, `post` etc. If `operation` is not specified, validators will be generated for all the operations defined by the swagger api. If you are setting an `operation` option, you should set a `path` as well.
    - `parameters` - (*Boolean*) - (optional) - Set to `false` if you don't need to build validators for `parameters`. Default values is `true`.
    - `responses` - (*Boolean*) - (optional) - Set to `false` if you don't need to build validators for `responses`. Default values is `true`.
    - `joischema` - (*Boolean*) - (optional) - Set to `true` if you want to use [Joi](https://github.com/hapijs/joi) schema based Validators. Swagvali uses [enjoi](https://github.com/tlivings/enjoi) - The json to joi schema converter - to build the validator functions, if `joischema` option is set to `true`.

    By default `swagvali` uses [is-my-json-valid](https://github.com/mafintosh/is-my-json-valid) JSON schema validator (when `joischema` option is set as `false`).

* `callback` -  (*Function*) - (optional) - `function (error, mock)`. If a callback is not provided a `Promise` will be returned.

### Validators

The `Swagvali` api generates a validator object for each parameter or response definition. The validator object has,

- `spec` - (*Object*) - The spec of the parameter or the response.

- `validate` - (*Function*) - `function (data)` - The validate function that accepts the `data` to be validated. The validate function uses [is-my-json-valid](https://github.com/mafintosh/is-my-json-valid) validator by default. If the `joischema` option was set to `true`, the validator function uses Joi](https://github.com/hapijs/joi) schema validator.

- `joischema` - (*Object*) - The `Joi` schema object, if the `joischema` option was set as `true`. Otherwise this will be `undefined`.

#### validate response

The `validate` function response has,

- `status` - (*Boolean*) - The status of the validation.
- `errors` - (*Array*) - The list of errors for the validation.
- `value` - The validated value with any type coercions/conversions and other modifiers applied. (the input is left unchanged). `value` can be incomplete, if validation failed.
