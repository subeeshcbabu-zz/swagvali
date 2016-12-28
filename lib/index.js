const Parser = require('swagger-parser');
const Co = require('co');
const Builder = require('./builder/validator');

const OPERATIONS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch'];

const validator = (api, { path, operation, validated, parameters = true, responses = true, joischema = false } = {}) => {

    return Co(function* () {
        let apiResolver = validated ? Promise.resolve(api) : Parser.validate(api);
        let parsed = yield apiResolver;
        let result = {};
        let pathObj;
        let operationObj;
        //List of paths
        let paths = parsed.paths;
        /**
         * Find the path and operation from the parsed api schema object.
         */
        if (path) {
            pathObj = paths[path];
            if (!pathObj) {
                //path not found. Reject the promise result with an error.
                yield Promise.reject(new Error(`Specfied path ${path} is not found in the api definition`));
            }
            // Operation of the path
            operationObj = pathObj[operation];
            if (!operationObj) {
                //operation not found. Reject the promise result with an error.
                yield Promise.reject(new Error(`Specfied operataion ${operation} for path ${path}, is not found in the api definition`));
            }
            //Build validators for parameters
            if (parameters === true) {
                buildParamValidators(pathObj, operationObj, result, joischema);
            }
            //Build validators for responses.
            if (responses === true && operationObj.responses) {
                buildRespValidators(operationObj, result, joischema);
            }
        } else {
            /**
             * All paths
             */
            //Iterate over all the path objects
            Object.keys(paths).forEach(path => {
                pathObj = paths[path];
                result[path] = {};
                //Iterate over all the operation objects
                Object.keys(pathObj).forEach(operation => {
                    //Filter only valid operations
                    if (OPERATIONS.includes(operation)) {
                        let opsObj = pathObj[operation];
                        result[path][operation] = {};
                        //Build validators for parameters
                        if (parameters === true) {
                            buildParamValidators(pathObj, opsObj, result[path][operation], joischema);
                        }
                        //Build validators for responses.
                        if (responses === true && opsObj.responses) {
                            buildRespValidators(opsObj, result[path][operation], joischema);
                        }
                    }
                });
            });
        }
        //Return the result as the resolution of the Promise.
        return result;
    });
};

/**
 * Merge the common parameters at the path level to the operation parameters.
 * Common parameters are a list of parameters that are applicable for all the operations
 * described under a particular path. These parameters can be overridden at the operation level,
 * but cannot be removed there.
 */
const mergeParams = (pathObj, opsObj) => {
    let commonParams = pathObj.parameters;
    let opsParams = opsObj.parameters;
    let paramMap = new Map();
    if (commonParams) {
        for (let param of commonParams) {
            //A unique parameter is defined by a combination of a name and location
            paramMap.set(param.name + param.in, param);
        }
    }
    if (opsParams) {
        for (let param of opsParams) {
            //A unique parameter is defined by a combination of a name and location
            paramMap.set(param.name + param.in, param);
        }
    }
    return Array.from(paramMap.values());
};
/**
 * Build parameter validator functions based on spec
 *
 **/
const buildParamValidators = (pathObj, operationObj, result, joischema) => {
    //Override the path level parameters with the operation level parametrs.
    let params = mergeParams(pathObj, operationObj);
    if (params && params.length > 0) {
        result['parameters'] = params.map(param => Builder(param, joischema));
    }
};

/**
 * Build response validator functions based on spec
 *
 **/
const buildRespValidators = (opsObj, result, joischema) => {
    let respKeys = Object.keys(opsObj.responses);
    if (respKeys && respKeys.length > 0) {
        result['responses'] = {};
        respKeys.forEach(resp => {
            result['responses'][resp] = Builder(opsObj.responses[resp], joischema);
        });
    }
};

module.exports = validator;
