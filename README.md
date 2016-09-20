# swagvali
A module to build validators for Swagger(OpenApi) Request parameters and Response objects.

## Install

```
npm i swagvali

```

## Usage

```javascript
    const Swagvali = require('swagvali');
    const api = 'http://petstore.swagger.io/v2/swagger.json';
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

`Swagvali(api, [options])`

* `api` - (*Object*) or (*String*) or (*Promise*) - (required) - api can be one of the following.
    - A relative or absolute path to the Swagger api document.
    - A URL of the Swagger api document.
    - The swagger api Object
    - A promise (or a `thenable`) that resolves to the swagger api Object

* `options` - (*Object*) - (optional) - Additional options to create the mock generator.
    - `validated` -  Set this property to `true` if the api is already validated against swagger schema and already dereferenced all the `$ref`. This is really useful to generate mocks for parsed api specs. Default value for this is `false` and the api will be validated using [swagger-parser validate](https://github.com/BigstickCarpet/swagger-parser/blob/master/docs/swagger-parser.md#validateapi-options-callback).
    - `path` - (*String*) - (optional) - The path for which the validators need to be generated. For example `/pet/findByStatus`, `/pet` etc. If a `path` is not specified, validators will be generated for all the paths defined by the swagger api. If you are setting a `path` option, you should set an `operation` as well.
    - `operation` - (*String*) - (optional) - The operation for which the validators need to be generated. For example `get`, `post` etc. If `operation` is not specified, validators will be generated for all the operations defined by the swagger api. If you are setting an `operation` option, you should set a `path` as well.
    - `parameters` - (*Boolean*) - (optional) - Set to `false` if you don't need to build validators for `parameters`. Default values is `true`.
    - `responses` - (*Boolean*) - (optional) - Set to `false` if you don't need to build validators for `responses`. Default values is `true`.

## validators

The `Swagvali` api generates a validator object for each parameter or response definition. The validator object has, 

- `spec` - (*Object*) - The spec of the parameter or the response.

- `validate` - (*Function*) - `function (data)` - The validate function that accepts the `data` to be validated.

### validate response

The `validate` function response has,

- `status` - (*Boolean*) - The status of the validation.
- `errors` - (*Array*) - The list of errors for the validation.
