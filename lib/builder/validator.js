const V = require('is-my-json-valid');

const builder = (param) => {

    let schemaV = V(param.schema || param);

    return {
        parameter: param,
        validator: function validateParam(data) {
            //Data Coercion goes here
            return {
                status: schemaV(data),
                errors: schemaV.errors
            };
        }
    }
};

module.exports = builder;
