import express, { Express } from "express";
import consumeMessages from "./api/consumeMessages";
import newFunction from "./api/newFunction";
import search from "./api/search";
import startConsuming from "./kafka/kafkaConsumer";
import { logout, refreshToken, login } from "./api/auth";
import { conf } from "./config/config";

const app: Express = express();
const cors = require("cors");

const server = app.listen(8081, function () {
  console.log("Start func api");

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  // authetification
  app.post("/login", login);
  app.post("/refresh", refreshToken);
  app.post("/logout", logout);

  // application
  app.post("/processes/search", search);
  app.post("/functions", newFunction);
  app.post("/consume-kafka-messages", consumeMessages);

  if (conf("CONSUME_ON_STARTUP") === "true") {
    startConsuming();
  }
});
