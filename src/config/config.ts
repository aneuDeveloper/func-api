import defaultConf from "../default-config.json";

var conf = function (confName: string) {
  console.log("Getting config=" + confName);
  if (process.env[confName] != null) {
    console.log(
      "Getting config from environment variables " + confName + "=" +
        process.env[confName],
    );
    return process.env[confName];
  }
  console.log(
    "Could not retrieve config with name=" + confName +
      " from environment variables. Try to get a default value from config file inside the application.",
  );
  type ObjectKey = keyof typeof defaultConf;
  const myVar = confName as ObjectKey;
  if (defaultConf[myVar] == null) {
    throw new Error("config not defined");
  }
  return defaultConf[myVar];
};

module.exports = conf;
