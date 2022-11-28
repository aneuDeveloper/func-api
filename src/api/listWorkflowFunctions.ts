import { Request, Response } from "express";
import deserializer from '../kafka/deserializer'
const sql = require("mssql");
const conf = require('../config/config.ts')

var config = {
  user: conf("DB_USER"),
  password: conf("DB_PASSWORD"),
  server: conf("DB_SERVER"),
  database: conf("DB_DATABASE"),
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



var listWorkflowFunctions = function (req: Request, res: Response) {
  const processInstanceid = req.params["process_instanceid"];
  console.log(processInstanceid);
  sql.on("error", (err: Error) => {
    console.log("Error on.");
    console.log(err);
    res.send(err);
  });

  sql
    .connect(config)
    .then((pool: any) => {
      return (
        pool
          .request()
          .input("process_instanceid", sql.VarChar(50), processInstanceid)
          .query(
            `
            SELECT * FROM func_events
            WHERE process_instanceid=@process_instanceid
            `,
          )
      );
    })
    .then((result: any) => {
      console.log("got result");
      let response: any = {
        "result": new Array(),
      };

      for (const k in result.recordset) {
        const dbRow = result.recordset[k];
        const deserializedEvent = deserializer(dbRow["kafka_message"])
        response.result.push(
          {
            "id": dbRow["id"],
            "coming_from_id": dbRow["coming_from_id"],
            "correlation_id": dbRow["correlation_id"],
            "process_instanceid": dbRow["process_instanceid"],
            "time_stamp": dbRow["time_stamp"],
            "process_name": dbRow["process_name"],
            "func" : dbRow["func"],
            "func_type" : dbRow["func_type"],
            "retry_count": dbRow["retry_count"],
            "data": deserializedEvent.get("data"),
            "source_topic": dbRow["source_topic"],
          },
        );
        console.log(result.recordset[k]["id"]);
      }
      res.append("Access-Control-Allow-Origin", "*");
      res.send(response);
    })
    .catch((err: Error) => {
      console.log("Error catch.");
      console.log(err);
      res.send(err);
    });
};
export default listWorkflowFunctions;
