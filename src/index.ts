import express, { Express, Request, Response } from "express";
import searchFunctions from "./api/searchFunction";
import listFunctions from "./api/listWorkflowFunctions";
import startConsuming from "./kafka/kafkaConsumer";
const app: Express = express();
import submitFunction from "./api/submitFunction";

app.get("/functions/search", searchFunctions);
app.get("/workflow/:process_instanceid/functions", listFunctions);

app.get("/startConsuming", (req: Request, res: Response) => {
  console.log("startConsuming");
  startConsuming();
  res.append("Access-Control-Allow-Origin", "*");
  res.send("triggered");
});

app.get("/ping", (req: Request, res: Response) => {
  res.append("Access-Control-Allow-Origin", "*");
  res.send("pong");
});

app.post("/submitFunction", (req: Request, res: Response) => {
  submitFunction(
    <string> req.query.source_topic,
    req.body,
    <string> req.query.comingFromId,
    <string> req.query.processName,
    <string> req.query.processInstanceID,
    <string> req.query.func,
    <string> req.query.func_type,
  );
  res.append("Access-Control-Allow-Origin", "*");
  res.send("sent");
});

const server = app.listen(8081, function () {
  console.log("Start application");
});
