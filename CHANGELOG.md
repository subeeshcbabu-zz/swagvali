## Unreleased

- Fix for #10 - If the swagger spec definition for a parameter is optional (`"required": "false"`), allow `null` or `undefined` value to be passed to the validator.
- Fix for #8 - Coercion is done only, if `data` is not null or not undefined.
