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
            if (Array.isArray(data)) {
                return data;
            }
            let separator = collectionFormat[param.collectionFormat] || collectionFormat.csv;
            return separator(data);
        };
        break;
    case 'string':
        coerce = String;
        break;
    default:
        //TODO Object Coercion
        coerce = data => data
    }
    return coerce;
};
module.exports = coercer;
