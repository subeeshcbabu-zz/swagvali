const V = require('is-my-json-valid');

const builder = (param) => {

    let dataValidator = {};
    //Configure pre Validations if any.
    dataValidator.pre = preValidator(param);
    //Configure the `is-my-json-valid` as the main action.
    dataValidator.action = V(param.schema || param);
    let coerce = coercer(param);

    return {
        parameter: param,
        validate: function validateParam(data) {
            let status;
            let errors;
            //Data Coercion
            let nData = coerce(data);
            //Pre validations
            if (dataValidator.pre) {
                status = dataValidator.pre(nData);
            }
            //If pre validations failed, validate using `is-my-json-valid`
            if (!status && dataValidator.action) {
                status = dataValidator.action(nData);
                errors = dataValidator.action.errors
            }
            //Return status and errors
            return {
                status,
                errors
            };
        },
    };
};

const collectionFormat = {
    csv : val => val.split(','),
    ssv: val => val.split(' '),
    tsv: val => val.split('\t'),
    pipes: val => val.split('|'),
    multi: val => val
};

const coercer = (param) => {
    let coerce;
    switch (param.type) {
        case 'array':
            coerce = (data) => {
                if (Array.isArray(data)) {
                    return data;
                }
                let separator = collectionFormat[param.collectionFormat] || collectionFormat.csv;
                return separator(data);
            };
            break;
        default:
            coerce = (data) => {
                return data;
            };
    }
    return coerce;
}
/**
 * Special Pre Validations - These swagger(OpenAPI) specific validations,
 * not supported by generic json validator
 **/
const preValidator = (param) => {
    let pre;
    // If the parameter is not a required parameter.
    // Either `required` not defined or `required` set as `false`.
    if (!param.required && param.schema && (param.in === 'body' || param.in === 'formData')) {
        pre = (data) => {
            if (data === null
                || data === undefined
                || (data && data.constructor === Object && Object.keys(data).length === 0)) {
                return true;
            }
        };
    // allowEmptyValue - Sets the ability to pass empty-valued parameters.
    // This is valid only for either query or formData parameters
    // and allows you to send a parameter with a name only or an empty value.
    } else if (param.allowEmptyValue && (param.in === 'query' || param.in === 'formData')){
        pre = (data) => {
            if (data === null
                || data === undefined
                || data === '') {
                return true;
            }
        };
    }
    return pre;
};
module.exports = builder;
