/**
 * Special Pre Validations - These swagger(OpenAPI) specific validations,
 * not supported by generic json validator like `is-my-json-valid`.
 **/
const preValidator = (param) => {
    let pre;
    let defaultResult = {
        skip: false,
        status: true,
        errors: null
    };
    // If the parameter is not a required parameter.
    // Either `required` not defined or `required` set as `false`.
    if (!param.required && param.schema && (param.in === 'body' || param.in === 'formData')) {
        pre = (data) => {
            let result = Object.assign({}, defaultResult);
            if (data === null
                || data === undefined
                || (data && data.constructor === Object && Object.keys(data).length === 0)) {
                //Skip any upcoming Validation.
                result.skip = true;
            }
            return result
        };
    // allowEmptyValue - Sets the ability to pass empty-valued parameters.
    // This is valid only for either query or formData parameters
    // and allows you to send a parameter with a name only or an empty value.
    } else if (param.allowEmptyValue && (param.in === 'query' || param.in === 'formData')){
        pre = (data) => {
            let result = Object.assign({}, defaultResult);
            if (data === null
                || data === undefined
                || data === '') {
                //Skip any upcoming Validation.
                result.skip = true;
            }
            return result;
        };
    } else if (param.type === 'file') {
        //Change the param type `file` to `string`
        param.type = 'string';
        pre = () => {
            let result = Object.assign({}, defaultResult);
            //This is pretty much a noop. The validator uses the new spec to valiadte the file.
            //TODO. Add additional validations for file type.
            return result;
        };
    }
    return pre;
};

module.exports = preValidator;
