const collectionFormat = {
    csv : val => val.split(','),
    ssv: val => val.split(' '),
    tsv: val => val.split('\t'),
    pipes: val => val.split('|'),
    multi: val => val
};

const coercer = (param) => {
    let coerce;
    switch (param.type) {
    case 'array':
        coerce = (data) => {
            //The data has to be either an array or a string (or an object with split function impl).
            //If the data is an array, no need convert it, return as it is.
            //If the data is a string, parse it using `collectionFormat`.
            //If the data is not a string, return the value as it is.
            //  Checking only for the existance of `split` function.
            //  If the data has a split function impl that returns an array, the
            //  coercion function, will simply use that.
            if (Array.isArray(data) || !(data && typeof data.split === 'function')) {
                return data;
            }

            let separator = collectionFormat[param.collectionFormat] || collectionFormat.csv;

            return separator(data);
        };
        break;
    case 'number':
    case 'integer':
    case 'float':
    case 'long':
    case 'double':
        coerce = (data) => {
            //If not a Number, return the data as it is.
            if (isNaN(data)) {
                return data;
            }
            //Parse to a number.
            return Number(data);
        };
        break;
    case 'string':
        coerce = String;
        break;
    case 'boolean':
        coerce = (data) => {
            if (data === 'true') {
                return true;
            } else if (data === 'false') {
                return false;
            } else {
                return data;
            }
        };
        break;

    default:
        //TODO Object Coercion
        coerce = data => data;
    }
    return coerce;
};
module.exports = coercer;
