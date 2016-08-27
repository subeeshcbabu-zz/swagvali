const Parser = require('swagger-parser');
const Co = require('co');
const Builder = require('./builder/validator');

const validator = ({ api, path, operation, validated }) => {

    //Assert.ok(api, 'A Swagger Object, or the file path or URL of your Swagger API should be provided.');
    return Co(function* () {
        let parsed = validated ? yield api : yield Parser.validate(api);
        let result;
        let pathObj;
        //List of paths
        let paths = parsed.paths;
        /**
         * Find the path and operation from the parsed api schema object.
         */
        if (path) {
            let operationObj;
            let params;
            pathObj = paths[path];
            if (!pathObj) {
                //path not found. Reject the promise result with an error.
                yield Promise.reject(new Error(`Specfied path ${path} is not found in the api definition`));
            }
            operationObj = pathObj[operation];
            if (!operationObj) {
                //operation not found. Reject the promise result with an error.
                yield Promise.reject(new Error(`Specfied operataion ${operation} for path ${path}, is not found in the api definition`));
            }
            params = operationObj.parameters;
            if (params) {
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
                    let params = pathObj[operation].parameters;
                    result[path][operation] = {};
                    if (params) {
                        result[path][operation]['parameters'] = params.map(param => Builder(param));
                    }
                });
            });
        }
        //Return the result as the resolution of the Promise.
        return result;
    });
};

module.exports = validator;
