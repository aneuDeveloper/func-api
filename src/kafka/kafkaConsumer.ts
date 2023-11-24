const { Kafka, CompressionTypes, CompressionCodecs } = require("kafkajs");
const SnappyCodec = require("kafkajs-snappy");
CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec;
const conf = require("../config/config");
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

const tableName = conf("DB_FUNC_TABLE");

function handleMessage(topic: string, messages) {
  if (messages == null) {
    return;
  }

  const table = new sql.Table(tableName);
  table.create = false;
  table.columns.add("id", sql.VarChar(255), { nullable: true });
  table.columns.add("time_stamp", sql.VarChar(255), { nullable: true });
  table.columns.add("process_name", sql.VarChar(255), { nullable: true });
  table.columns.add("coming_from_id", sql.VarChar(255), { nullable: true });
  table.columns.add("process_instanceid", sql.VarChar(255), { nullable: true });
  table.columns.add("func", sql.VarChar(255), { nullable: true });
  table.columns.add("func_type", sql.VarChar(11), { nullable: true });
  table.columns.add("next_retry_at", sql.BigInt, { nullable: true });
  table.columns.add("source_topic", sql.VarChar(255), { nullable: true });
  table.columns.add("retry_count", sql.Int, { nullable: true });
  table.columns.add("kafka_message", sql.VarChar(sql.MAX), { nullable: true });

  for (let message of messages) {
    const messageStr = message!.value!.toString();
    const functionEvent = deserializer(messageStr);
    table.rows.add(
      functionEvent.get("id"),
      functionEvent.get("timestamp"),
      functionEvent.get("processName"),
      functionEvent.get("comingFromId"),
      functionEvent.get("processInstanceID"),
      functionEvent.get("func"),
      functionEvent.get("func_type"),
      getNumber(functionEvent, "nextRetryAt"),
      topic,
      getNumber(functionEvent, "retryCount"),
      functionEvent.get("data")
    );
    console.log("Add row kafka message: "+functionEvent.get("data"));
  }

  const request = new sql.Request();
  console.log("exe bulk");
  request.bulk(table, (err, result) => {
    if (err != null) {
      console.log(err);
    }
    console.log(result);
  });
}

function getNumber(functionEvent, key: string) {
  const valueAsString = functionEvent.get(key);
  if (valueAsString != null) {
    return parseInt(valueAsString);
  }
  return null;
}

async function startConsuming() {
  const bootstrapserver = conf("BOOTSTRAPSERVER");
  console.log("Starting kafka consumer with BOOTSTRAPSERVER=" + bootstrapserver);

  const connectionTimeout = parseInt(conf("CONNECTION_TIMEOUT"));
  console.log("CONNECTION_TIMEOUT=" + connectionTimeout);
  const kafka = new Kafka({
    clientId: conf("KAFKA_CLIENT_ID"),
    brokers: [bootstrapserver],
    connectionTimeout: connectionTimeout,
    maxBytes: parseInt(conf("MAX_BYTES")),
  });
  const consumer = kafka.consumer({ groupId: conf("KAFKA_GROUP_ID") });
  await consumer.connect();

  const topics = conf("FUNC_TOPICS");
  await consumer.subscribe({
    topics: [topics],
    fromBeginning: true,
  });

  sql.on("error", (err: Error) => {
    console.log("Error on.");
    console.log(err);
  });

  try {
    await sql.connect(config);
  } catch (err) {
    console.log(err);
  }

  consumer.run({
    eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {
      handleMessage(batch.topic, batch.messages);
    },
  });
}

export default startConsuming;
