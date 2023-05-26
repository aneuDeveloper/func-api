import { Request, Response } from "express";
const conf = require("../config/config");
const jwt = require("jsonwebtoken");

export function authentify(req: Request, res: Response): boolean {
  try {
    const authHeader = "" + req.headers["Authorization"];
    const stripedToken = authHeader.replace("Bearer ", "");
    var decoded = jwt.verify(stripedToken, "mysecret");
    return true;
  } catch (err) {
    // err
    return false;
  }
}

export default async function (req: Request, res: Response) {
  const { username, password } = req.body;
  var token = jwt.sign({ me: "culpa" }, "mysecret");
  res.send({ token: token });
}
