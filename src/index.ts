import express, { Express, Request, Response } from "express"
import search from "./api/search"
import startConsuming from "./kafka/kafkaConsumer"
import bodyParser from "body-parser"
const app: Express = express()
const cors = require("cors")

const server = app.listen(8081, function () {
  console.log("Start func api")

  app.use(bodyParser.text())
  app.use(cors())

  app.post("/processes/search", bodyParser.json(), search)
  // app.post("/functions", async (req: Request, res: Response) => {
  //   const messageBody = req.body
  //   console.log("got body=" + messageBody)

  //   try {
  //     await POSTFunction(
  //       <string>req.query.source_topic,
  //       messageBody,
  //       <string>req.query.comingFromId,
  //       <string>req.query.processName,
  //       <string>req.query.processInstanceID,
  //       <string>req.query.func,
  //       <string>req.query.func_type
  //     )
  //     res.status(200).send('{ "status": "OK" }')
  //   } catch (error) {
  //     console.log(error)
  //     res.status(500).send('{ "status": "ERROR" }')
  //   }
  // })

  app.post("/consume-kafka-messages", (req: Request, res: Response) => {
    startConsuming()
    res.send("Consuming...")
  })
})
