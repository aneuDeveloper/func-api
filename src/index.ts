import express, { Express, Request, Response } from "express";
import search from "./api/search";
import login from "./api/login";
import getFunction from "./api/getFunction";
import startConsuming from "./kafka/kafkaConsumer";
import createFunction from "./api/functions";
import bodyParser from "body-parser";
import { authentify } from "./api/login";

const app: Express = express();
const cors = require("cors");

const server = app.listen(8081, function () {
  console.log("Start func api");

  app.use(bodyParser.text());
  app.use(cors());

  app.post("/login", bodyParser.json(), login);
  app.post("/functions/search", bodyParser.json(), search);
  app.get("/ping", (req: Request, res: Response) => {
    res.send("pong");
  });
  app.get("/functions/:function_id", getFunction);
  app.post("/functions", createFunction);

  app.post("/consume-kafka-messages", (req: Request, res: Response) => {
    if (!authentify(req, res)) {
      return;
    }

    startConsuming();
    res.send("Consuming...");
  });
});
