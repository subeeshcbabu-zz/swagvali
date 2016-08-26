const Tape = require('tape');
const Validators = require('../lib');

Tape('Validators', t => {

    let api = 'https://raw.githubusercontent.com/subeeshcbabu/swaggerize-examples/master/api/echo.yaml';
    let validators;
    /**
     * Postive test case: default
     */
    t.test('with api', assert => {
        validators = Validators({
            api
        });
        validators
            .then(res => {
                /**
                 * Validate response
                 */
                assert.end();
            })
            .catch(err => {
                assert.error(err);
                assert.end();
            });
    });
    /**
     * Negative test case: No api
     */
    t.test('no api', assert => {
        validators = Validators({});
        validators
            .catch(err => {
                assert.ok(err);
                assert.comment(err);
                assert.end();
            });
    });
    /**
     * Negative test case: wrong api
     */
    t.test('wrong api', assert => {
        validators = Validators({
            api: 'wrong api'
        });
        validators
            .catch(err => {
                assert.ok(err);
                assert.comment(err);
                assert.end();
            });
    });

    /**
     * Negative test case: wrong path
     */
    t.test('wrong path', assert => {
        validators = Validators({
            api,
            path: 'wrongpath'
        });
        validators
            .catch(err => {
                assert.ok(err);
                assert.comment(err);
                assert.end();
            });
    });
});
