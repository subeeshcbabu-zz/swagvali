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
    } else if (param.type === 'file') {
        //TODO Implement validator for type = file.
        pre = () => {
            return true;
        };
    }
    return pre;
};

module.exports = preValidator;
