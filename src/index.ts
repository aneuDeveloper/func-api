import express, { Express, Request, Response } from "express"
import search from "./api/search"
import newFunction from "./api/newFunction"
import startConsuming from "./kafka/kafkaConsumer"
import bodyParser from "body-parser"
const app: Express = express()
const cors = require("cors")
const conf = require("./config/config")

const server = app.listen(8081, function () {
  console.log("Start func api")

  app.use(bodyParser.text())
  app.use(cors())

  app.post("/processes/search", bodyParser.json(), search)
  app.post("/functions", newFunction)
  app.post("/consume-kafka-messages", (req: Request, res: Response) => {
    startConsuming()
    res.send("Consuming...")
  })

  if (conf("CONSUME_ON_STARTUP") === true) {
    startConsuming()
  }
})
