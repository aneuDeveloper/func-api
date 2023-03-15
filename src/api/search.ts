import { Request, Response } from "express";
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
  const { freetext } = req.body;

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
          .input("freetext", sql.VarChar, "%" + freetext + "%")
          .query(
            `
            SELECT *
            FROM ${funcTableName}
            WHERE kafka_message LIKE @freetext
            ORDER BY time_stamp, process_instanceid DESC OFFSET 0 ROWS FETCH NEXT 50 ROWS ONLY
            `,
          )
      );
    })
    .then((result: any) => {
      let response: any = {
        "result": new Array(),
      };

      for (const k in result.recordset) {
        const dbRow = result.recordset[k];
        response.result.push(
          {
            "id": dbRow["id"],
            "coming_from_id": dbRow["coming_from_id"],
            "func": dbRow["func"],
            "func_type": dbRow["func_type"],
            "process_instanceid": dbRow["process_instanceid"],
            "time_stamp": dbRow["time_stamp"],
            "process_name": dbRow["process_name"],
          },
        );
      }
      res.send(response);
    })
    .catch((err: Error) => {
      console.log("Error catch.");
      console.log(err);
      res.send(err);
    });
};

export default search;
