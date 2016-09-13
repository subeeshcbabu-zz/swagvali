const V = require('is-my-json-valid');
const Coercer = require('./coercer');
const PreValidator = require('./prevalidator.js');

const builder = (param) => {

    let dataValidator = {};
    //Configure pre Validations if any.
    dataValidator.pre = PreValidator(param);
    //Configure the `is-my-json-valid` as the main action.
    if (param.type !== 'file') {
        dataValidator.action = V(param.schema || param);
    }

    let coerce = Coercer(param);

    return {
        parameter: param,
        validate: function validateParam(data) {
            let status;
            let errors;
            //Data Coercion
            let nData = coerce && coerce(data);
            //Pre validations
            if (dataValidator.pre) {
                status = dataValidator.pre(nData);
            }
            //If pre validations failed, validate using `is-my-json-valid`
            if (!status && dataValidator.action) {
                status = dataValidator.action(nData);
                errors = dataValidator.action.errors;
            }
            //Return status and errors
            return {
                status,
                errors
            };
        },
    };
};

module.exports = builder;
