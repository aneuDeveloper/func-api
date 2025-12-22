import { authentify } from "./login";
import { Request, Response } from "express";

const { Kafka, CompressionTypes, CompressionCodecs } = require("kafkajs");
const SnappyCodec = require("kafkajs-snappy");
CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec;
const conf = require("../config/config");
import { v4 as uuidv4 } from "uuid";
const kafka = new Kafka({
  clientId: conf("KAFKA_CLIENT_ID"),
  brokers: [conf("BOOTSTRAPSERVER")],
});
const producer = kafka.producer();
// createPartitioner: Partitioners.LegacyPartitioner

export default async function (req: Request, res: Response) {
  if (!authentify(req, res)) {
    return;
  }

  try {
    console.debug("on submit topic=" + req.query.source_topic);
    const newId = uuidv4();
    var currentMilliseconds = new Date().getTime();

    let message =
      "v=1,id=" +
      newId + //
      ",timestamp=" +
      currentMilliseconds + //
      ",processName=" +
      req.query.processName + //
      ",processInstanceID=" +
      req.query.processInstanceID + //
      ",func_type=" +
      req.query.func_type + //
      ",sourceTopic=" +
      req.query.source_topic;

    let comingFromId = req.query.comingFromId;
    if (comingFromId != null) {
      message += ",comingFromId=" + comingFromId;
    }
    let func = req.query.func;
    if (func != null) {
      message += ",func=" + func;
    }

    message += "$e%," + req.body;

    console.log("Sending kafka message: " + message);

    await producer.connect();
    await producer.send({
      topic: req.query.source_topic,
      messages: [{ key: null, value: message }],
    });

    res.status(200).send('{ "status": "OK" }');
  } catch (error) {
    console.log(error);
    res.status(500).send('{ "status": "ERROR" }');
  }
}
