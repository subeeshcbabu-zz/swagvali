module.exports = [
    'azure.com:arm-web',
    'bbc.com',
    'bbci.co.uk',
    'bbryiot.com',
    'citrixonline.com:scim', //Parser validation issues
    'firebrowse.org',//Wrong enum values with format=date
    'getsandbox.com',//`is-my-json-valid` fails to create a validator(Out of memory)
    'gettyimages.com', //Wrong enum definition. enum as a type=array
    'github.com', //Missing type=string for enums
    'googleapis.com:adsense',//Parser validation issues
    'googleapis.com:consumersurveys',//`is-my-json-valid` fails to create a validator(Out of memory)
    'googleapis.com:dataflow',
    'googleapis.com:datastore',
    'googleapis.com:gmail',
    'googleapis.com:servicemanagement',
    'googleapis.com:tagmanager',
    'jirafe.com',//Max range for numbers
    'motaword.com',//Parser validation issues
    'patientview.org',//`is-my-json-valid` fails to create a validator(Out of memory)
    'pushpay.com',//`is-my-json-valid` fails to create a validator(Out of memory)
    'rebilly.com',//wrong items def for type array
    'simplyrets.com',//Wrong enum definition. enum as a type=array
    'stackexchange.com',// Wrong enum definition. type=string, but enum has boolean values
    'uploady.com',//Parser validation issues
    'versioneye.com',//Parser validation issues
    'watchful.li'//Parser validation issues
];
