import { EachMessagePayload } from "kafkajs";
const { Kafka, CompressionTypes, CompressionCodecs } = require("kafkajs");
const SnappyCodec = require("kafkajs-snappy");
CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec;
import { Request, Response } from "express";
const conf = require("../config/config.ts");
import deserializer from "./deserializer";

const sql = require("mssql");

var config = {
  user: conf("DB_USER"),
  password: conf("DB_PASSWORD"),
  server: conf("DB_SERVER"),
  database: conf("DB_DATABASE"),
  port: 1433,
  pool: {
    max: 10,
    min: 1,
    idleTimeoutMillis: 10000,
    log: true,
  },
  options: {
    encrypt: false,
    enableArithAbort: true,
  },
};

function handleMessage(messagePayload: EachMessagePayload) {
  const { topic, message } = messagePayload;
  if (message == null || message.value == null) {
    return;
  }
  const messageStr = message.value!.toString();
  const functionEvent = deserializer(messageStr);
  sql
    .connect(config)
    .then((pool: any) => {
      return (
        pool
          .request()
          .input("id", sql.VarChar(50), functionEvent.get("id"))
          .input("time_stamp", sql.VarChar(50), functionEvent.get("timestamp"))
          .input(
            "process_name",
            sql.VarChar(50),
            functionEvent.get("processName"),
          )
          .input(
            "coming_from_id",
            sql.VarChar(50),
            functionEvent.get("comingFromId"),
          )
          .input(
            "process_instanceid",
            sql.VarChar(50),
            functionEvent.get("processInstanceID"),
          )
          .input("func", sql.VarChar(50), functionEvent.get("function"))
          .input("func_type", sql.VarChar(50), functionEvent.get("type"))
          .input("source_topic", sql.VarChar(50), topic)
          .input(
            "correlation_state",
            sql.VarChar(50),
            functionEvent.get("correlationState"),
          )
          .input(
            "next_retry_at",
            sql.VarChar(50),
            functionEvent.get("nextRetryAt"),
          )
          .input(
            "retry_count",
            sql.VarChar(50),
            functionEvent.get("retryCount"),
          )
          .input("message_key", sql.VarChar(50), message.key)
          .input("kafka_message", sql.VarChar(), messageStr)
          .query(
            `
        INSERT INTO func_events
        (id, time_stamp, process_name, coming_from_id, process_instanceid, func, func_type, next_retry_at, source_topic, message_key, correlation_state, retry_count, kafka_message)
        VALUES(@id, @time_stamp, @process_name, @coming_from_id, @process_instanceid, @func, @func_type, @next_retry_at, @source_topic, @message_key, @correlation_state, @retry_count, @kafka_message);
        `,
          )
      );
    })
    // .then((result: any) => {
    // })
    .catch((err: Error) => {
      console.log(err);
      console.log("Could not store: " + functionEvent);
    });
}

async function startConsuming() {
  const kafka = new Kafka({
    clientId: conf("KAFKA_CLIENT_ID"),
    brokers: [conf("BOOTSTRAPSERVER")],
  });
  const consumer = kafka.consumer({ groupId: conf("KAFKA_GROUP_ID") });
  await consumer.connect();

  const workflows = conf("WORKFLOWS");
  const topics = [workflows + "-WORKFLOW"];
  await consumer.subscribe(
    {
      topics: topics,
      fromBeginning: true,
    },
  );

  sql.on("error", (err: Error) => {
    console.log("Error on.");
    console.log(err);
  });

  await consumer.run({
    eachMessage: handleMessage,
  });
}

export default startConsuming;
