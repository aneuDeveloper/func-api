import { Request, Response } from "express";
const conf = require("../config/config");
const jwt = require("jsonwebtoken");

const jwtSecret = conf("JWT_SECRET");
const authType = conf("AUTH_TYPE");

export function authentify(req: Request, res: Response): boolean {
  try {
    const authHeader = "" + req.headers["authorization"];
    const stripedToken = authHeader.replace("Bearer ", "");
    var decoded = jwt.verify(stripedToken, jwtSecret);
    return true;
  } catch (err) {
    // err
    res.status(401).send({ status: "UNAUTHORIZED" });
    return false;
  }
}

export default async function (req: Request, res: Response) {
  const { username, password } = req.body;
  if ("ENVIRONMENT" === authType) {
    var user = conf("ENVIRONMENT_USER");
    var user_pwd = conf("ENVIRONMENT_PASSWORD");
    if (user === username && password === user_pwd) {
      var token = jwt.sign({ auth: "ROLE_ADMIN,ROLE_USER" }, jwtSecret);
      res.status(200).send({ token: token });
      return;
    }
  }
  res.status(400).send({ status: "WRONG_CREDENTIALS" });
}
