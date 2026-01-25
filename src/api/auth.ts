import { Request, Response } from "express";
import { conf } from "../config/config";

const authEnabled = conf("AUTHENTIFICATION_ENABLED");
const { createRemoteJWKSet, jwtVerify } = require("jose");
const axios = require("axios");

// Open Id, password
const wellKnownUrl = conf("OPENID_WELL_KNOWN_URL");
let token_endpoint: string;
let client_id: string;
let client_secret: string;
let redirect_uri: string;
let jwks_uri: string;
let JWKS: any;

if (authEnabled == "true" || authEnabled == "TRUE") {
  const authType = conf("AUTH_TYPE");
  if (authType == "OIDC") {
    client_id = conf("OPENID_CLIENT_ID");
    client_secret = conf("OPENID_CLIENT_SECRET");
    redirect_uri = conf("CLIENT_EXPOSED_OPENID_REDIRECT_URL");

    configureOIDCEndpoints();
  }
}

async function configureOIDCEndpoints() {
  try {
    const response = await axios.get(wellKnownUrl, {
      headers: {
        Accept: "application/json",
      },
    });
    token_endpoint = response.data.token_endpoint;
    jwks_uri = response.data.jwks_uri;

    console.info("Configured token_endpoint:", token_endpoint, "and jwks_uri:", jwks_uri);
    return response.data;
  } catch (error) {
    console.error("Could not configure OIDC endpoints error:", error);
    throw error;
  }
}

export default async function verifyAuth(req: Request, res: Response) {
  try {
    const authorizationToken = ("" + req.headers["authorization"]).split(" ")[1];
    if (authorizationToken == null || !authorizationToken) {
      res.status(401).send({
        message: "unauthorized",
      });
      return null;
    }
    if (JWKS == null) {
      JWKS = createRemoteJWKSet(new URL(jwks_uri));
    }
    const { payload } = await jwtVerify(authorizationToken, JWKS, {
      audience: "account",
    });
    return payload;
  } catch (error: any) {
    console.log("token invalid. Error=", error);
    if (error.code === "ERR_JWT_EXPIRED") {
      res.status(401).send({
        message: "Your authentification is invalid.",
      });
    }
    return null;
  }
}

export async function login(req: Request, res: Response) {
  const { code, session_state } = req.body;
  try {
    const response = await axios.post(
      token_endpoint,
      new URLSearchParams({
        client_id: client_id,
        client_secret: client_secret,
        grant_type: "authorization_code",
        code: "" + code,
        session_state: "" + session_state,
        redirect_uri: redirect_uri,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        responseType: "json",
      },
    );

    // secure should be true if using TSL
    res.cookie("refreshToken", response.data.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/auth/refresh",
    });
    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;
    let family_name = "";
    let given_name = "";
    try {
      const parts = accessToken.split(".");
      const payload = parts[1];

      const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
      family_name = decoded.family_name;
      given_name = decoded.given_name;
    } catch (parseEx) {}

    console.info("use was logged in family_name=", family_name, "family_name=", family_name);
    return res.json({ accessToken, refreshToken, family_name, given_name });
  } catch (error: any) {
    console.error("login failed with code=", code, error.message);
    res.status(400).send({
      errormessage: "Login failed. " + error.message,
    });
  }
}

export async function refreshToken(req: Request, res: Response) {
  let refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    refreshToken = req.body.refreshToken;
  }
  if (!refreshToken) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  try {
    const response = await axios.post(
      token_endpoint,
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: client_id,
        client_secret: client_secret,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        responseType: "json",
      },
    );

    const newAccessToken = response.data.access_token;
    const newRefreshToken = response.data.refresh_token;

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/auth/refresh",
    });

    return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie("refreshToken", { path: "/auth/refresh" });
  return res.json({ message: "Logged out" });
}
