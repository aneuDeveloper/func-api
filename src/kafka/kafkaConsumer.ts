import { EachMessagePayload } from "kafkajs"
const { Kafka, CompressionTypes, CompressionCodecs } = require("kafkajs")
const SnappyCodec = require("kafkajs-snappy")
CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec
const conf = require("../config/config")

const { Client } = require("@opensearch-project/opensearch")
var client = new Client({
  node: "https://admin:adfksjKJ3423.adf@localhost:9200",
  ssl: {
    rejectUnauthorized: false,
    // cert: fs.readFileSync(client_cert_path),
    // key: fs.readFileSync(client_key_path)
  },
})

const decoder = new TextDecoder("utf-8")

async function handleMessageAsOpensearch(messagePayload: EachMessagePayload) {
  const { topic, message } = messagePayload
  if (message == null || message.value == null) {
    return
  }
  const messageStr = message.value!.toString()

  var step: Record<string, unknown> = {}
  var customHeader: Record<string, unknown> = {}
  step["message"] = messageStr
  step["custom_header"] = customHeader
  step["from_topic"] = topic

  const headers = message.headers
  var processInstanceID = null
  var processName = null
  if (headers) {
    for (const [headerKey, headerValue] of Object.entries(headers)) {
      if (headerValue == null) {
        continue
      }
      if (headerKey == "process_instance_id") {
        processInstanceID = headerValue.toString("utf8")
      } else if (headerKey == "process_name") {
        processName = headerValue.toString("utf8")
      } else {
        var key = null
        if (headerKey == "id") {
          key = "id"
        } else if (headerKey == "v") {
          key = "v"
        } else if (headerKey == "destination_topic") {
          key = "destination_topic"
        } else if (headerKey == "timestamp") {
          key = "timestamp"
        } else if (headerKey == "coming_from_id") {
          key = "coming_from_id"
        } else if (headerKey == "function") {
          key = "function"
        } else if (headerKey == "retry_count") {
          key = "retry_count"
        } else if (headerKey == "execute_at") {
          key = "execute_at"
        } else if (headerKey == "type") {
          key = "type"
        }

        if (headerValue != null) {
          if (key != null) {
            step[key] = headerValue.toString("utf8")
          } else {
            customHeader[headerKey] = headerValue.toString("utf8")
          }
        }
      }
    }
  }

  var process = {
    process_instance_id: processInstanceID,
    process_name: processName,
    steps: [step],
  }

  try {
    var response = await client.index({
      id: process.process_instance_id,
      index: "processes",
      body: process,
      refresh: true,
      op_type: "create",
    })
    console.log("Inserted")
  } catch (exception) {
    // TODO: execute only if the entry already exists
    try {
      const result = await client.update({
        index: "processes",
        id: process.process_instance_id,
        body: {
          script: {
            source: "ctx._source.steps.add(params.newStep)",
            params: {
              newStep: step,
            },
          },
        },
      })
      console.log("Updated")
    } catch (exception) {
      console.error(exception)
    }
  }
}

async function startConsuming() {
  const bootstrapserver = conf("BOOTSTRAPSERVER")
  console.log("Starting kafka consumer with BOOTSTRAPSERVER=" + bootstrapserver)

  const connectionTimeout = parseInt(conf("CONNECTION_TIMEOUT"))
  console.log("CONNECTION_TIMEOUT=" + connectionTimeout)
  const kafka = new Kafka({
    clientId: conf("KAFKA_CLIENT_ID"),
    brokers: [bootstrapserver],
  })
  const consumer = kafka.consumer({ groupId: conf("KAFKA_GROUP_ID") })
  await consumer.connect()

  const topics = conf("FUNC_TOPICS")
  await consumer.subscribe({
    topics: [topics],
    fromBeginning: true,
  })

  consumer.run({
    eachMessage: handleMessageAsOpensearch,
  })
}

export default startConsuming
