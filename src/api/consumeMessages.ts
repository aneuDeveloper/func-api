import auth from "./auth";
import { Request, Response } from "express";
import startConsuming from "../kafka/kafkaConsumer";

export default async function (req: Request, res: Response) {
  if (!auth(req, res)) {
    return;
  }
  startConsuming();
  res.send("Consuming...");
}
