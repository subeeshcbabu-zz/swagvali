const Parser = require('swagger-parser');
const Co = require('co');
const Builder = require('./builder/validator');

const validator = ({ api, path, operation, validated }) => {

    //Assert.ok(api, 'A Swagger Object, or the file path or URL of your Swagger API should be provided.');
    return Co(function* () {
        let parsed = validated ? yield api : yield Parser.validate(api);
        let result;
        let pathObj;
        let operationObj;
        let params;
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
            //Override the path level parameters with the operation level parametrs.
            params = mergeParams(pathObj, operationObj);
            if (params && params.length > 0) {
                result = params.map(param => Builder(param));
            }

        } else {
            /**
             * All paths
             */
            result = {};
            //Iterate over all the path objects
            Object.keys(paths).forEach(path => {
                pathObj = paths[path];
                result[path] = {};
                //Iterate over all the operation objects
                Object.keys(pathObj).forEach(operation => {
                    let params;
                    result[path][operation] = {};
                    //Override the path level parameters with the operation level parametrs.
                    params = mergeParams(pathObj, pathObj[operation]);
                    if (params && params.length > 0) {
                        result[path][operation]['parameters'] = params.map(param => Builder(param));
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

module.exports = validator;
