const { Kafka, CompressionTypes, CompressionCodecs } = require("kafkajs");
const SnappyCodec = require("kafkajs-snappy");
CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec;
const conf = require("../config/config.ts");
import { v4 as uuidv4 } from "uuid";
const kafka = new Kafka({
  clientId: conf("KAFKA_CLIENT_ID"),
  brokers: [conf("BOOTSTRAPSERVER")],
});
const producer = kafka.producer();

export default async function (
  source_topic: String,
  body: String,
  comingFromId: String,
  processName: String,
  processInstanceID: String,
  func: String,
  func_type: String,
) {
  console.debug("on submit topic=" + source_topic);
  const newId = uuidv4();
  var currentMilliseconds = new Date().getTime();

  let message = "v=1,id=" + newId + //
    ",timestamp=" + currentMilliseconds + //
    ",processName=" + processName + //
    ",processInstanceID=" + processInstanceID + //
    ",func_type=" + func_type + //
    ",sourceTopic=" + source_topic;

  if (comingFromId != null) {
    message += ",comingFromId=" + comingFromId;
  }
  if (func != null) {
    message += ",func=" + func;
  }

  message += "$e%," + body;

  console.log("Sending kafka message: "+message);

  try {
    await producer.connect();
    await producer.send({
      topic: source_topic,
      messages: [
        { key: null, value: message },
      ],
    });
  } catch (error) {
    console.log(error);
  }
}
