import defaultConf from '../default-config.json';

var conf = function (confName: String) {
    if (process.env.confName !== null && !!process.env.confName) {
        return process.env.confName
    }
    type ObjectKey = keyof typeof defaultConf;
    const myVar = confName as ObjectKey;
    if (defaultConf[myVar] == null) {
        throw new Error('config not defined')
    }
    return defaultConf[myVar];
}

module.exports = conf;