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
  const { freetext, processInstanceId } = req.body;
  sql.on("error", (err: Error) => {
    console.log("Error on.");
    console.log(err);
    res.send(err);
  });

  console.debug("Connect to database=" + env("DB_DATABASE") + ", server=" + env("DB_SERVER") + ", table=" + funcTableName);
  sql
    .connect(config)
    .then((pool: any) => {
      let queryParams = new Array();

      const request = pool.request();
      if (freetext != null && freetext !== "") {
        request.input("freetext", sql.VarChar, "%" + freetext + "%");
        queryParams.push("kafka_message LIKE @freetext");
      }
      if (processInstanceId != null && processInstanceId !== "") {
        request.input("process_instanceid", sql.VarChar(50), processInstanceId);
        queryParams.push("process_instanceid=@process_instanceid");
      }
      const queryString =
        `SELECT *
         FROM ${funcTableName}
      ` +
        (queryParams.length > 0 ? " WHERE " + queryParams.join(" AND ") : "") +
        " ORDER BY time_stamp DESC OFFSET 0 ROWS FETCH NEXT 50 ROWS ONLY";
      console.info(queryString);
      return request.query(queryString);
    })
    .then((result: any) => {
      let response: any = {
        result: new Array(),
      };

      for (const k in result.recordset) {
        const dbRow = result.recordset[k];
        response.result.push({
          id: dbRow["id"],
          coming_from_id: dbRow["coming_from_id"],
          func: dbRow["func"],
          func_type: dbRow["func_type"],
          process_instanceid: dbRow["process_instanceid"],
          time_stamp: dbRow["time_stamp"],
          process_name: dbRow["process_name"],
          kafka_message: dbRow["kafka_message"],
        });
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
