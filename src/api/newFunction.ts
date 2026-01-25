import auth from "./auth";
import { Request, Response } from "express";
import { conf } from "../config/config";

const { Kafka, CompressionTypes, CompressionCodecs } = require("kafkajs");
const SnappyCodec = require("kafkajs-snappy");
CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec;
import { v4 as uuidv4 } from "uuid";
const kafka = new Kafka({
  clientId: conf("KAFKA_CLIENT_ID"),
  brokers: [conf("BOOTSTRAPSERVER")],
});
const producer = kafka.producer();

export default async function (req: Request, res: Response) {
  if (!auth(req, res)) {
    return;
  }

  try {
    let toTopic = req.query.to_topic;
    console.debug("on submit topic=", toTopic);

    let messageHeader = {
      v: "1",
      id: uuidv4(),
      timestamp: getCurrentIsoOffsetDateTime(),
      process_name: req.query.process_name,
      process_instance_id: req.query.process_instance_id,
    };

    let functionType = req.query.type;
    if (functionType != null) {
      Object.assign(messageHeader, { type: functionType });
    } else {
      Object.assign(messageHeader, { type: "WORKFLOW" });
    }

    let comingFromId = req.query.coming_from_id;
    if (comingFromId != null) {
      Object.assign(messageHeader, { coming_from_id: comingFromId });
    }
    let funcValue = req.query.func;
    if (funcValue != null) {
      Object.assign(messageHeader, { func: funcValue });
    }

    await producer.connect();
    await producer.send({
      topic: toTopic,
      messages: [
        {
          key: null,
          value: req.body,
          headers: messageHeader,
        },
      ],
    });

    res.status(200).send('{ "status": "OK" }');
  } catch (error) {
    console.log(error);
    res.status(500).send('{ "status": "ERROR" }');
  }
}

function getCurrentIsoOffsetDateTime(): string {
  const date = new Date(Date.now());

  const pad = (n: number, z = 2) => String(n).padStart(z, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const millisecs = pad(date.getMilliseconds(), 3);

  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetMinutes);
  const offsetHours = pad(Math.floor(absOffset / 60));
  const offsetMins = pad(absOffset % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${millisecs}${sign}${offsetHours}:${offsetMins}`;
}
