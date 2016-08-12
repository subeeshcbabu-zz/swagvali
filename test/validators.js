const Tape = require('tape');
const Validators = require('../lib');

Tape('Validators', t => {
    let api = 'https://raw.githubusercontent.com/subeeshcbabu/swaggerize-examples/master/api/echo.yaml';
    let validators = Validators({
        api
    });
    validators.then(res => t.comment(res)).catch(err => t.error(err));

});
