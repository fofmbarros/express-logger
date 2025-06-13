import type { Request, RequestHandler } from "express";
import { XMLParser } from "fast-xml-parser";
import { randomUUID } from "node:crypto";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

type LoggerLevel = "info" | "warn" | "error";

type LoggerFunction = (
  context: Record<string, unknown>,
  message: string
) => void;

type Logger = Record<LoggerLevel, LoggerFunction>;

interface Config {
  logger?: Logger;
}

const parseBody = (body: unknown, contentType?: string) => {
  if (typeof body === "object" || typeof body === "undefined") return body;

  const parsedContentType = contentType?.split("; ")[0];

  switch (parsedContentType) {
    case "image/svg+xml":
    case "application/xml":
    case "application/atom+xml":
    case "text/xml": {
      const parser = new XMLParser({
        ignoreDeclaration: true,
        parseTagValue: false,
      });
      const value = parser.parse(body as string);
      return value;
    }
    case "application/json":
      return JSON.parse(body as string);
    default:
      return body;
  }
};

const getLoggerLevel = (statusCode: number): LoggerLevel => {
  const level =
    statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";

  return level;
};

const getRequestIp = (req: Request): string =>
  (req.headers["x-envoy-external-address"] as string) ?? req.ip ?? "0.0.0.0";

const requestLogger =
  (config?: Config): RequestHandler =>
  (req, res, next) => {
    const logger = config?.logger ?? {
      info: console.log,
      warn: console.warn,
      error: console.error,
    };

    const requestId = randomUUID();
    req.requestId = requestId;

    let rawResponseBody: unknown;
    let responseBody: unknown;

    const send = res.send;
    res.send = (body) => {
      const contentType = res.getHeader("Content-Type");

      rawResponseBody = body;
      responseBody = parseBody(
        body,
        typeof contentType === "string" ? contentType : undefined
      );

      res.send = send;
      return res.send(body);
    };

    res.on("finish", () => {
      const level = getLoggerLevel(res.statusCode);
      const ip = getRequestIp(req);

      logger[level](
        { requestId },
        `[${ip}] [${req.method}] ${
          req.originalUrl
        } ${req.protocol.toUpperCase()} ${req.httpVersion} ${res.statusCode}`
      );

      const requestContentType = req.header("Content-Type");
      const requestBody = parseBody(req.body, requestContentType);

      logger[level](
        { requestId, type: "REQUEST" },
        JSON.stringify({
          params: req.params,
          query: req.query,
          headers: req.headers,
          cookies: req.cookies,
          rawBody: req.body,
          body: requestBody,
        })
      );

      logger[level](
        { requestId, type: "RESPONSE" },
        JSON.stringify({
          rawBody: rawResponseBody,
          body: responseBody,
        })
      );
    });

    next();
  };

export type { Logger, Config };
export default requestLogger;
