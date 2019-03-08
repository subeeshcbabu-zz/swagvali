/**
 * Special Pre Validations - These swagger(OpenAPI) specific validations,
 * not supported by generic json validator like `is-my-json-valid`.
 **/
const preValidator = (param) => {
    let pre = [];
    let defaultResult = {
        skip: false,
        status: true,
        errors: null
    };
    // If the parameter is not a required parameter.
    // Either `required` not defined or `required` set as `false`.
    if (!param.required) {
        //For `body` and `formData` check empty Object also.
        if (param.schema && (param.in === 'body' || param.in === 'formData')) {
            pre.push(((data) => {
                let result = Object.assign({}, defaultResult);
                if (data == null
                    || (data && data.constructor === Object && Object.keys(data).length === 0)) {
                    //Skip any upcoming Validation.
                    result.skip = true;
                }
                return result;
            }));
        } else {
            pre.push(((data) => {
                let result = Object.assign({}, defaultResult);
                if (data == null) {
                    //Skip any upcoming Validation.
                    result.skip = true;
                }
                return result;
            }));
        }
    }
    // allowEmptyValue - Sets the ability to pass empty-valued parameters.
    // This is valid only for either query or formData parameters
    // and allows you to send a parameter with a name only or an empty value.
    if (param.allowEmptyValue && (param.in === 'query' || param.in === 'formData')) {
        pre.push(((data) => {
            let result = Object.assign({}, defaultResult);
            if (data == null || data === '') {
                //Skip any upcoming Validation.
                result.skip = true;
            }
            return result;
        }));
    }

    // To handle the OpenAPI data type `file` for parameters
    if (param.type === 'file') {
        //Change the param type `file` to `string`
        param.type = 'string';
        pre.push((() => {
            let result = Object.assign({}, defaultResult);
            //This is pretty much a noop. The validator uses the new spec to valiadte the file.
            //TODO. Add additional validations for file type.
            return result;
        }));
    }

    // To handle the OpenAPI data type `file` for responses
    if (param.schema && param.schema.type === 'file') {
        //Change the param type `file` to `string`
        param.schema.type = 'string';
        pre.push((() => {
            let result = Object.assign({}, defaultResult);
            //This is pretty much a noop. The validator uses the new spec to valiadte the file.
            //TODO. Add additional validations for file type.
            result.skip = true;

            return result;
        }));
    }

    return pre;
};

module.exports = preValidator;
