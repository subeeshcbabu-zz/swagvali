//const Assert = require('assert');
const Parser = require('swagger-parser');
const Co = require('co');

const validator = ({ api, path, validated }) => {

    //Assert.ok(api, 'A Swagger Object, or the file path or URL of your Swagger API should be provided.');
    return Co(function* () {
        let parsed = validated ? yield api : yield Parser.validate(api);
        let validators = {};
        //List of paths
        let paths = parsed.paths;

        if (path) {
            let pathObj = paths[path]
            //Found the path
            if (!pathObj) {
                yield Promise.reject(new Error(`Specfied path ${path} is not found in the api definition`));
            }

        } else {
            //All the paths
            Object.keys(paths).forEach((path) => {
                let pathObj = paths[path];

            });
        }

        return validators;
    });
};

module.exports = validator;
