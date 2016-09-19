const V = require('is-my-json-valid');
const Coercer = require('./coercer');
const PreValidator = require('./prevalidator.js');

const builder = (spec) => {

    let dataValidator = {};
    if (!spec.type && !spec.schema) {
        //No schema and No type defined for the spec.
        return;
    }
    //Configure pre Validations if any.
    dataValidator.pre = PreValidator(spec);
    //Configure the `is-my-json-valid` as the main action.
    if (spec.type !== 'file') {
        dataValidator.action = V(spec.schema || spec);
    }

    let coerce = Coercer(spec);

    return {
        spec,
        validate: function validate(data) {
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
