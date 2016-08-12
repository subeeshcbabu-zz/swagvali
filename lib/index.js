const Parser = require('swagger-parser');
const Assert = require('assert');
const Co = require('co');

const validator = (options = {}) => {

    Assert.ok(options.api, 'A Swagger Object, or the file path or URL of your Swagger API should be provided.');
    let resolved = Co(function* (options) {
        let parsed = yield Parser.validate(options.api);
        let validators = {};
        for (const pathObj of parsed.paths) {
            //TODO logic goes in here.
        }
        return validators;
    });
};

module.exports = validator
