import defaultConf from "../default-config.json";

export function conf(confName: string): string {
  if (process.env[confName] != null) {
    console.log("Found property=", confName, " in environment");
    return "" + process.env[confName];
  } else {
    console.log("Could not get property=", confName, " from environment. Try to get the property from default-config.json");
  }
  type ObjectKey = keyof typeof defaultConf;
  const myVar = confName as ObjectKey;
  if (defaultConf[myVar] == null) {
    throw new Error("config=" + confName + " not defined");
  }
  return "" + defaultConf[myVar];
}

export function secretOrConf(confName: string) {
  if (process.env[confName] != null) {
    console.log("Found property=", confName, " in environment");
    return process.env[confName];
  } else {
    console.log("Could not get property=", confName, " from environment. Try to get the property from default-config.json");
  }
  type ObjectKey = keyof typeof defaultConf;
  const myVar = confName as ObjectKey;
  if (defaultConf[myVar] == null) {
    throw new Error("config=" + confName + " not defined");
  }
  return defaultConf[myVar];
}
