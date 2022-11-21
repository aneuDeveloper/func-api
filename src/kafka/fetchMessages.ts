const { Kafka } = require('kafkajs')
import { Request, Response } from "express";
import { KafkaMessage } from "kafkajs"
const conf = require('../config/config.ts')
const deserializer = require('deserializer.ts')
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

const startFetching = async function (req: Request, res: Response) {
    console.log("startFetching");

    const kafka = new Kafka({
        clientId: conf("KAFKA_CLIENT_ID"),
        brokers: [conf("BOOTSTRAPSERVER")],
    })
    const consumer = kafka.consumer({ groupId: conf("KAFKA_GROUP_ID") })
    await consumer.connect()
    await consumer.subscribe({ topic: 'test-topic', fromBeginning: true })

    sql.on("error", (err: Error) => {
        console.log("Error on.");
        console.log(err);
    });

    await consumer.run({
        eachMessage: async (topic: string, key: string, message: KafkaMessage) => {
            const functionEvent = deserializer(message.value)

            sql
                .connect(config)
                .then((pool: any) => {
                    return (
                        pool
                            .request()
                            .input("id", sql.VarChar(50), functionEvent.get("id"))
                            .input("time_stamp", sql.VarChar(50), functionEvent.get(""))
                            .input("process_name", sql.VarChar(50), functionEvent.get(""))
                            .input("coming_from_id", sql.VarChar(50), functionEvent.get(""))
                            .input("process_instanceid", sql.VarChar(50), functionEvent.get(""))
                            .input("func", sql.VarChar(50), functionEvent.get(""))
                            .input("func_type", sql.VarChar(50), functionEvent.get(""))
                            .input("next_retry_at", sql.VarChar(50), functionEvent.get(""))
                            .input("source_topic", sql.VarChar(50), topic)
                            .input("message_key", sql.VarChar(50), functionEvent.get(""))
                            .input("correlation_state", sql.VarChar(50), functionEvent.get(""))
                            .input("retry_count", sql.VarChar(50), functionEvent.get(""))
                            .input("key", sql.VarChar(50), key)
                            .input("kafka_message", sql.VarChar(), functionEvent)
                            .query(
                                `
            INSERT INTO tempdb.dbo.func_events
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

        },
    })
    res.send("triggered");
}

module.exports = startFetching;