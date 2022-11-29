import { Request, Response } from "express";
const sql = require("mssql");

var config = {
  user: "sa",
  password: "LocalAdmin_123",
  server: "localhost",
  database: "tempdb",
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

var searchFunctions = function (req: Request, res: Response) {
  console.debug("on search")
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
          // .input('input_parameter', sql.Int, value)
          .query(
            `
            SELECT *
            FROM func_events
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
            "func" : dbRow["func"],
            "func_type" : dbRow["func_type"],
            "process_instanceid": dbRow["process_instanceid"],
            "time_stamp": dbRow["time_stamp"],
            "process_name": dbRow["process_name"],
          },
        );
        console.log(result.recordset[k]["id"]);
      }
      res.send(response);
    })
    .catch((err: Error) => {
      console.log("Error catch.");
      console.log(err);
      res.send(err);
    });
};

export default searchFunctions;
