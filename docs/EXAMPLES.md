# Sawgvali Examples

## Promise response

### Specific path and operation

```javascript
    const Swagvali = require('swagvali');
    const api = 'http://petstore.swagger.io/v2/swagger.json';
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
