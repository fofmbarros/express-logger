import { expect, test, vi } from "vitest";
import express, { json, text, type Express } from "express";
import request from "supertest";
import { pino } from "pino";
import requestLogger, { type Config } from "./index.js";
import { XMLBuilder, XMLParser } from "fast-xml-parser";

const setupApp = (config?: Config): Express => {
  const app = express();
  app.use(requestLogger(config));

  app.post("/json", json(), (req, res) => {
    res.json({ hello: req.body.message });
  });

  app.post("/xml", text({ type: "text/xml" }), (req, res) => {
    const xmlParser = new XMLParser({
      ignoreDeclaration: true,
      parseTagValue: false,
    });

    const parsedBody = xmlParser.parse(req.body);

    res.setHeader("Content-Type", "text/xml");
    res.send(
      `<?xml version="1.0" encoding="UTF-8"?><hello>${parsedBody.message}</hello>`
    );
  });

  app.get("/warning", (_, res) => {
    res.sendStatus(400);
  });

  app.get("/error", (_, res) => {
    res.sendStatus(500);
  });

  return app;
};

const randomUUIDMockValue = "a152bcf8-88c1-4c1c-bef3-5e812b5dd45e";
vi.mock("node:crypto", () => ({
  randomUUID: () => randomUUIDMockValue,
}));

test("it should log json body with console", async () => {
  const app = setupApp();

  const consoleLogMock = vi.spyOn(console, "log");

  const message = "world";
  const response = await request(app)
    .post("/json")
    .set("Host", "127.0.0.1")
    .send({ message });

  expect(response.status).toEqual(200);
  expect(response.body.hello).toEqual("world");

  expect(consoleLogMock).toBeCalledWith(
    expect.objectContaining({ requestId: randomUUIDMockValue }),
    "[::ffff:127.0.0.1] [POST] /json HTTP 1.1 200"
  );

  expect(consoleLogMock).toBeCalledWith(
    expect.objectContaining({
      requestId: randomUUIDMockValue,
      type: "REQUEST",
    }),
    JSON.stringify({
      params: {},
      query: {},
      headers: {
        host: "127.0.0.1",
        "accept-encoding": "gzip, deflate",
        "content-type": "application/json",
        "content-length": "19",
        connection: "close",
      },
      cookies: undefined,
      rawBody: { message },
      body: { message },
    })
  );

  expect(consoleLogMock).toBeCalledWith(
    expect.objectContaining({
      requestId: randomUUIDMockValue,
      type: "RESPONSE",
    }),
    JSON.stringify({
      rawBody: JSON.stringify({ hello: message }),
      body: { hello: message },
    })
  );
});

test("it should log json body with pino", async () => {
  const logger = pino();

  const app = setupApp({ logger });

  const pinoInfoMock = vi.spyOn(logger, "info");

  const message = "world";
  const response = await request(app)
    .post("/json")
    .set("Host", "127.0.0.1")
    .send({ message });

  expect(response.status).toEqual(200);
  expect(response.body.hello).toEqual("world");

  expect(pinoInfoMock).toBeCalledWith(
    expect.objectContaining({ requestId: randomUUIDMockValue }),
    "[::ffff:127.0.0.1] [POST] /json HTTP 1.1 200"
  );

  expect(pinoInfoMock).toBeCalledWith(
    expect.objectContaining({
      requestId: randomUUIDMockValue,
      type: "REQUEST",
    }),
    JSON.stringify({
      params: {},
      query: {},
      headers: {
        host: "127.0.0.1",
        "accept-encoding": "gzip, deflate",
        "content-type": "application/json",
        "content-length": "19",
        connection: "close",
      },
      cookies: undefined,
      rawBody: { message },
      body: { message },
    })
  );

  expect(pinoInfoMock).toBeCalledWith(
    expect.objectContaining({
      requestId: randomUUIDMockValue,
      type: "RESPONSE",
    }),
    JSON.stringify({
      rawBody: JSON.stringify({ hello: message }),
      body: { hello: message },
    })
  );
});

test("it should log xml body with console", async () => {
  const app = setupApp();

  const consoleLogMock = vi.spyOn(console, "log");

  const message = "world";

  const builder = new XMLBuilder();
  const xmlContent = builder.build({ message });
  const rawRequestBody = `<?xml version="1.0" encoding="UTF-8"?>${xmlContent}`;

  const response = await request(app)
    .post("/xml")
    .set("Host", "127.0.0.1")
    .set("Content-Type", "text/xml")
    .send(rawRequestBody);

  expect(response.status).toEqual(200);

  expect(consoleLogMock).toBeCalledWith(
    expect.objectContaining({ requestId: randomUUIDMockValue }),
    "[::ffff:127.0.0.1] [POST] /xml HTTP 1.1 200"
  );

  expect(consoleLogMock).toBeCalledWith(
    expect.objectContaining({
      requestId: randomUUIDMockValue,
      type: "REQUEST",
    }),
    JSON.stringify({
      params: {},
      query: {},
      headers: {
        host: "127.0.0.1",
        "accept-encoding": "gzip, deflate",
        "content-type": "text/xml",
        "content-length": "62",
        connection: "close",
      },
      cookies: undefined,
      rawBody: rawRequestBody,
      body: { message },
    })
  );

  expect(consoleLogMock).toBeCalledWith(
    expect.objectContaining({
      requestId: randomUUIDMockValue,
      type: "RESPONSE",
    }),
    JSON.stringify({
      rawBody: `<?xml version="1.0" encoding="UTF-8"?><hello>${message}</hello>`,
      body: { hello: message },
    })
  );
});

test("it should log xml body with pino", async () => {
  const logger = pino();

  const app = setupApp({ logger });

  const pinoInfoMock = vi.spyOn(logger, "info");

  const message = "world";

  const builder = new XMLBuilder();
  const xmlContent = builder.build({ message });
  const rawRequestBody = `<?xml version="1.0" encoding="UTF-8"?>${xmlContent}`;

  const response = await request(app)
    .post("/xml")
    .set("Host", "127.0.0.1")
    .set("Content-Type", "text/xml")
    .send(rawRequestBody);

  expect(response.status).toEqual(200);

  expect(pinoInfoMock).toBeCalledWith(
    expect.objectContaining({ requestId: randomUUIDMockValue }),
    "[::ffff:127.0.0.1] [POST] /xml HTTP 1.1 200"
  );

  expect(pinoInfoMock).toBeCalledWith(
    expect.objectContaining({
      requestId: randomUUIDMockValue,
      type: "REQUEST",
    }),
    JSON.stringify({
      params: {},
      query: {},
      headers: {
        host: "127.0.0.1",
        "accept-encoding": "gzip, deflate",
        "content-type": "text/xml",
        "content-length": "62",
        connection: "close",
      },
      cookies: undefined,
      rawBody: rawRequestBody,
      body: { message },
    })
  );

  expect(pinoInfoMock).toBeCalledWith(
    expect.objectContaining({
      requestId: randomUUIDMockValue,
      type: "RESPONSE",
    }),
    JSON.stringify({
      rawBody: `<?xml version="1.0" encoding="UTF-8"?><hello>${message}</hello>`,
      body: { hello: message },
    })
  );
});

test("it should log warning with console", async () => {
  const app = setupApp();

  const consoleWarnMock = vi.spyOn(console, "warn");

  const response = await request(app).get("/warning").set("Host", "127.0.0.1");

  expect(response.status).toEqual(400);

  expect(consoleWarnMock).toBeCalledWith(
    expect.objectContaining({ requestId: randomUUIDMockValue }),
    "[::ffff:127.0.0.1] [GET] /warning HTTP 1.1 400"
  );
});

test("it should log warning with pino", async () => {
  const logger = pino();

  const app = setupApp({ logger });

  const pinoWarnMock = vi.spyOn(logger, "warn");

  const response = await request(app).get("/warning").set("Host", "127.0.0.1");

  expect(response.status).toEqual(400);

  expect(pinoWarnMock).toBeCalledWith(
    expect.objectContaining({ requestId: randomUUIDMockValue }),
    "[::ffff:127.0.0.1] [GET] /warning HTTP 1.1 400"
  );
});

test("it should log error with console", async () => {
  const app = setupApp();

  const consoleErrorMock = vi.spyOn(console, "error");

  const response = await request(app).get("/error").set("Host", "127.0.0.1");

  expect(response.status).toEqual(500);

  expect(consoleErrorMock).toBeCalledWith(
    expect.objectContaining({ requestId: randomUUIDMockValue }),
    "[::ffff:127.0.0.1] [GET] /error HTTP 1.1 500"
  );
});

test("it should log warning with pino", async () => {
  const logger = pino();

  const app = setupApp({ logger });

  const pinoErrorMock = vi.spyOn(logger, "error");

  const response = await request(app).get("/error").set("Host", "127.0.0.1");

  expect(response.status).toEqual(500);

  expect(pinoErrorMock).toBeCalledWith(
    expect.objectContaining({ requestId: randomUUIDMockValue }),
    "[::ffff:127.0.0.1] [GET] /error HTTP 1.1 500"
  );
});
