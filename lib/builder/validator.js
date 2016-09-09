const V = require('is-my-json-valid');

const builder = (param) => {

    let dataValidator = V(param.schema || param);
    return {
        parameter: param,
        validate: function validateParam(data) {
            //Data Coercion goes here
            return {
                status: dataValidator(data),
                errors: dataValidator.errors
            };
        },

    };
};

module.exports = builder;
