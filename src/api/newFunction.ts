import { authentify } from "./login"
import { Request, Response } from "express"

const { Kafka, CompressionTypes, CompressionCodecs } = require("kafkajs")
const SnappyCodec = require("kafkajs-snappy")
CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec
const conf = require("../config/config")
import { v4 as uuidv4 } from "uuid"
const kafka = new Kafka({
  clientId: conf("KAFKA_CLIENT_ID"),
  brokers: [conf("BOOTSTRAPSERVER")],
})
const producer = kafka.producer()

export default async function (req: Request, res: Response) {
  if (!authentify(req, res)) {
    return
  }

  try {
    let destinationTopic = req.query.destination_topic
    console.debug("on submit topic=", destinationTopic)

    let messageHeader = {
      v: "1",
      id: uuidv4(),
      timestamp: new Date().getTime(),
      process_name: req.query.processName,
      process_instance_id: req.query.processInstanceID,
      type: req.query.type,
    }

    let comingFromId = req.query.coming_from_id
    if (comingFromId != null) {
      Object.assign(messageHeader, { coming_from_id: comingFromId })
    }
    let funcValue = req.query.func
    if (funcValue != null) {
      Object.assign(messageHeader, { func: funcValue })
    }

    await producer.connect()
    await producer.send({
      topic: destinationTopic,
      messages: [
        {
          key: null,
          value: req.body,
          headers: messageHeader,
        },
      ],
    })

    res.status(200).send('{ "status": "OK" }')
  } catch (error) {
    console.log(error)
    res.status(500).send('{ "status": "ERROR" }')
  }
}
