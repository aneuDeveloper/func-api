import { Request, Response } from "express"
const env = require("../config/config")

const { Client } = require("@opensearch-project/opensearch")
var client = new Client({
  node: "https://admin:adfksjKJ3423.adf@localhost:9200",
  ssl: {
    rejectUnauthorized: false,
  },
})
// var funcTableName = env("DB_FUNC_TABLE");

var search = async function (req: Request, res: Response) {
  const { freetext, process_name } = req.body

  try {
    const query = {
      query: {
        bool: {
          must: new Array(),
        },
      },
    }

    if (freetext != null && freetext != "") {
      query.query.bool.must.push({
        nested: {
          path: "steps",
          query: {
            match_phrase: {
              "steps.message": freetext,
            },
          },
        },
      })
    }

    if (process_name != null && process_name != "") {
      query.query.bool.must.push({
        match: {
          process_name: process_name,
        },
      })
    }

    var searchResponse = await client.search({ index: "processes", body: query })

    let response: any = {
      result: new Array(),
    }

    for (const hit of searchResponse.body?.hits?.hits) {
      const processIntance = {
        process_name: hit._source.process_name,
        process_instance_id: hit._source.process_instance_id,
        steps: new Array(),
      }

      for (const funcEvent of hit._source?.steps) {
        processIntance.steps.push(funcEvent)
      }

      response.result.push(processIntance)
    }

    res.send(response)
  } catch (exception) {
    console.error(exception)
    res.status(500).send({
      message: "Unexpected error occured.",
    })
  }
}

export default search
