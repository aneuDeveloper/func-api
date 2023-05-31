import { Request, Response } from "express";
import { authentify } from "./login";
const sql = require("mssql");
const env = require("../config/config");

var config = {
  user: env("DB_USER"),
  password: env("DB_PASSWORD"),
  server: env("DB_SERVER"),
  database: env("DB_DATABASE"),
  port: 1433,
  pool: {
    max: 10,
    min: 1,
    idleTimeoutMillis: 10000,
    log: true,
  },
  options: {
    encrypt: false,
    enableArithAbort: true,
  },
};
var funcTableName = env("DB_FUNC_TABLE");

var search = function (req: Request, res: Response) {
  if (!authentify(req, res)) {
    return;
  }

  const function_id = req.params["function_id"];

  sql.on("error", (err: Error) => {
    console.log("Error on.");
    console.log(err);
    res.send(err);
  });

  console.debug(
    "Connect to database=" + env("DB_DATABASE") + ", server=" +
      env("DB_SERVER") + ", table=" + funcTableName,
  );
  sql.connect(config)
    .then((pool: any) => {
      return (
        pool
          .request()
          .input("function_id", sql.VarChar, "" + function_id)
          .query(
            `
            SELECT *
            FROM ${funcTableName}
            WHERE id=@function_id
            `,
          )
      );
    })
    .then((result: any) => {
      let result2 = {};

      for (const k in result.recordset) {
        const dbRow = result.recordset[k];
        result2 = {
          "id": dbRow["id"],
          "coming_from_id": dbRow["coming_from_id"],
          "func": dbRow["func"],
          "func_type": dbRow["func_type"],
          "process_instanceid": dbRow["process_instanceid"],
          "time_stamp": dbRow["time_stamp"],
          "process_name": dbRow["process_name"],
          "kafka_message": dbRow["kafka_message"],
          "source_topic": dbRow["source_topic"],
        };
      }
      res.send({
        "result": result2,
      });
    })
    .catch((err: Error) => {
      console.log("Error catch.");
      console.log(err);
      res.send(err);
    });
};

export default search;
