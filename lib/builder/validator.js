const JSONV = require('is-my-json-valid');
const Enjoi = require('enjoi');
const Coercer = require('./coercer');
const PreValidator = require('./prevalidator.js');

const jsonValidator = (spec) => {

    let V = JSONV(spec.schema || spec);

    return (data) => {
        let status = V(data);
        let errors = V.errors;
        return {
            status,
            errors
        };
    };
};

const toJoi = (spec) => {
    let Joi = Enjoi(spec.schema || spec);
    if (spec.required) {
        Joi = Joi.required();
    }
    if (spec.in !== 'body' && spec.allowEmptyValue){
        Joi = Joi.allow('').optional();
    }
    return Joi;
};

const joiValidator = (joiSpec) => {

    return (data) => {
        let result = joiSpec.validate(data);
        let status = (result.error === null || result.error === undefined);
        let errors = result.error;
        return {
            status,
            errors
        };
    };
};

const preValiExec = (checks, data) => {
    let result = {
        skip: false,
        status: true,
        errors: null
    };
    //Iterate over the pre validations.
    for (let i = 0; i < checks.length; i++) {
        result = checks[i] && checks[i](data);
        //If one of the check has a skip set to true, skip all future validations.
        if (result.skip) {
            break;
        }
    }
    return result;
};

const builder = (spec, joischema) => {

    let dataValidator = {};
    let _spec = Object.assign({}, spec);
    let joiSpec;
    if (!_spec.type && !_spec.schema) {
        //No schema and No type defined for the spec.
        return;
    }
    //Configure pre Validations if any.
    dataValidator.pre = PreValidator(_spec);

    if (joischema) {
        //Use enjoi schema converter and Joi validator.
        joiSpec = toJoi(_spec);
        dataValidator.action = joiValidator(joiSpec);
    } else {
        //Configure the `is-my-json-valid` as the main action.
        dataValidator.action = jsonValidator(_spec);
    }

    let coerce = Coercer(_spec);

    return {
        //Return the actual spec
        spec,
        //Validate function
        validate: function validate(data) {
            let result;
            let status;
            let errors = null;
            let skip = false;
            //Data Coercion
            let value;
            if (coerce && data != null) {
                value = coerce(data);
            }
            //Pre validations
            if (dataValidator.pre) {
                ({ status, errors, skip } = preValiExec(dataValidator.pre, value));
            }
            //If pre validation did not want to skip the Main validation
            if (!skip && dataValidator.action) {
                result = dataValidator.action.call(null, value);
                ({ status, errors } = result);
            }
            //Return status and errors
            return {
                status,
                errors,
                value
            };
        },
        //Joi schema. available only for `joischema` option set as `true`.
        joischema: joiSpec
    };
};

module.exports = builder;
