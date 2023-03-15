import defaultConf from "../default-config.json";

var conf = function (confName: string) {
  if (process.env[confName] != null) {
    console.log(
      process.env[confName],
    );
    return process.env[confName];
  }
  type ObjectKey = keyof typeof defaultConf;
  const myVar = confName as ObjectKey;
  if (defaultConf[myVar] == null) {
    throw new Error("config=" + confName + " not defined");
  }
  return defaultConf[myVar];
};

module.exports = conf;
