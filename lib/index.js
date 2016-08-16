const Parser = require('swagger-parser');
const Assert = require('assert');
const Co = require('co');


const validator = ({ api, path, validated }) => {

    Assert.ok(api, 'A Swagger Object, or the file path or URL of your Swagger API should be provided.');
    return Co(function* () {
        let parsed = validated ? yield api : yield Parser.validate(api);
        let validators = {};
        let paths = parsed.paths;
        if (path && paths[path]) {
            //Found the path

        } else {
            for (const path in paths) {

            }
        }

        return validators;
    });
};

module.exports = validator
