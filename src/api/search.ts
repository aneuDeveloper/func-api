import { Request, Response } from "express";
import { secretOrConf } from "../config/config";
import auth from "./auth";

const openSearchConnection = secretOrConf("OPEN_SEARCH_CONNECTION_STRING");

const { Client } = require("@opensearch-project/opensearch");
var client = new Client({
  node: openSearchConnection,
  ssl: {
    rejectUnauthorized: false,
  },
});

var search = async function (req: Request, res: Response) {
  if (!auth(req, res)) {
    return;
  }

  const { freetext, process_name } = req.body;

  try {
    const query = {
      query: {
        bool: {
          must: new Array(),
        },
      },
    };

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
      });
    }

    if (process_name != null && process_name != "") {
      query.query.bool.must.push({
        match: {
          process_name: process_name,
        },
      });
    }
    console.info(JSON.stringify(query));
    var searchResponse = await client.search({ index: "processes", body: query });

    let response: any = {
      result: new Array(),
    };

    for (const hit of searchResponse.body?.hits?.hits) {
      const processIntance = {
        process_name: hit._source.process_name,
        process_instance_id: hit._source.process_instance_id,
        steps: new Array(),
      };

      for (const funcEvent of hit._source?.steps) {
        processIntance.steps.push(funcEvent);
      }

      response.result.push(processIntance);
    }

    res.send(response);
  } catch (exception) {
    console.error(exception);
    res.status(500).send({
      message: "Unexpected error occured.",
    });
  }
};

export default search;
