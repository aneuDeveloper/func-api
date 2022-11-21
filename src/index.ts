import express, { Express, Request, Response } from "express";
import searchFunctions from "./api/searchFunction";
import startConsuming from "./kafka/kafkaConsumer";
const app: Express = express();
const listFunctions = require("./api/listWorkflowFunctions.ts");

app.get("/functions/search", searchFunctions);

app.get("/workflow/:process_instanceid/functions", listFunctions);

app.get("/startConsuming", (req: Request, res: Response) => {
  console.log("startConsuming");
  startConsuming();
  res.send("triggered");
});

app.get("/ping", (req: Request, res: Response) => {
  res.send("pong")
});

const server = app.listen(8081, function () {
  console.log("Start application");
});
