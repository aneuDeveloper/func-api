import express, { Express, Request, Response } from "express";
import searchFunctions from "./api/searchFunction";
import listFunctions from "./api/listWorkflowFunctions";
import startConsuming from "./kafka/kafkaConsumer";
import submitFunction from "./api/submitFunction";
import bodyParser from "body-parser";
const app: Express = express();
const cors = require('cors')

const server = app.listen(8081, function () {
  console.log("Start consuming kafka messages");

  app.use(bodyParser.text());
  app.use(cors())

  app.get("/functions/search", searchFunctions);
  app.get("/workflow/:process_instanceid/functions", listFunctions);
  app.get("/ping", (req: Request, res: Response) => {
    res.send("pong");
  });
  app.post("/submitFunction", (req: Request, res: Response) => {
    const messageBody = req.body;
    console.log("got body=" + messageBody);

    submitFunction(
      <string>req.query.source_topic,
      messageBody,
      <string>req.query.comingFromId,
      <string>req.query.processName,
      <string>req.query.processInstanceID,
      <string>req.query.func,
      <string>req.query.func_type,
    );
    res.send("Sent message. Headers=" + JSON.stringify(req.headers));
  });

  app.post("/test", (req: Request, res: Response) => {
    console.log(req.body);
    res.send("test and=" + req.body + " headers=" + JSON.stringify(req.headers));

    startConsuming();
  });
});
