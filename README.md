# Express Logger

Plug and play Express.js request and response middleware

## Getting started

### Installation

- NPM: `npm install @fofmbarros/express-logger`
- Yarn `yarn add @fofmbarros/express-logger`
- PNPM: `pnpm install @fofmbarros/express-logger`

### Usage (`console`)

```typescript
import express from "express";
import logger from "@fofmbarros/express-logger";

const app = express();
const port = 80;

app.use(logger());

app.post("/", (req, res) => {
  console.log(`Request ID from controller ${req.requestId}`);
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
```

### Examples

#### JSON Body

```bash
{ requestId: '6f56ae31-8a32-4dff-947f-1ade3217eac6' } [::ffff:127.0.0.1] [POST] /json HTTP 1.1 200
{ requestId: '6f56ae31-8a32-4dff-947f-1ade3217eac6', type: 'REQUEST' } {"params":{},"query":{},"headers":{"host":"localhost:5555","content-type":"application/json","user-agent":"insomnia/11.1.0","accept":"*/*","content-length":"30"},"rawBody":{"message":"Hello world!"},"body":{"message":"Hello world!"}}
{ requestId: '6f56ae31-8a32-4dff-947f-1ade3217eac6', type: 'RESPONSE' } {"rawBody":"{\"message\":\"Hello world!\"}","body":{"message":"Hello world!"}}
```

#### XML Body

```bash
{ requestId: '0d2bba94-aac7-48ff-94ef-388c0791ee1a' } [::ffff:127.0.0.1] [POST] /xml HTTP 1.1 200
{ requestId: '0d2bba94-aac7-48ff-94ef-388c0791ee1a', type: 'REQUEST' } {"params":{},"query":{},"headers":{"host":"localhost:5555","content-type":"application/xml","user-agent":"insomnia/11.1.0","accept":"*/*","content-length":"31"}}
{ requestId: '0d2bba94-aac7-48ff-94ef-388c0791ee1a', type: 'RESPONSE' } {"rawBody":"<?xml version=\"1.0\" encoding=\"UTF-8\"?><Message>Hello world!</Message>","body":{"Message":"Hello world!"}}
```

### Usage (`pino` with `pino-pretty`)

### Examples

```typescript
import express from "express";
import logger from "@fofmbarros/express-logger";
import { pino } from "pino";

const app = express();
const port = 80;

const pinoLogger = pino({
  transport: {
    target: "pino-pretty",
  },
});

app.use(logger({ logger: pinoLogger }));

app.post("/", (req, res) => {
  pinoLogger.info(`Request ID from controller ${req.requestId}`);
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
```

#### JSON Body

```bash
[16:32:38.769] INFO (44079): [::ffff:127.0.0.1] [POST] /json HTTP 1.1 200
    requestId: "3ba5c131-49c8-465a-8846-f91a370a9a4f"
[16:32:38.769] INFO (44079): {"params":{},"query":{},"headers":{"host":"localhost:5555","content-type":"application/json","user-agent":"insomnia/11.1.0","accept":"*/*","content-length":"30"},"rawBody":{"message":"Hello world!"},"body":{"message":"Hello world!"}}
    requestId: "3ba5c131-49c8-465a-8846-f91a370a9a4f"
    type: "REQUEST"
[16:32:38.769] INFO (44079): {"rawBody":"{\"message\":\"Hello world!\"}","body":{"message":"Hello world!"}}
    requestId: "3ba5c131-49c8-465a-8846-f91a370a9a4f"
    type: "RESPONSE"
```

#### XML Body

```bash
[16:31:31.732] INFO (44079): [::ffff:127.0.0.1] [POST] /xml HTTP 1.1 200
    requestId: "a86ae841-b7ed-45d0-a555-76e36a0b474a"
[16:31:31.732] INFO (44079): {"params":{},"query":{},"headers":{"host":"localhost:5555","content-type":"application/xml","user-agent":"insomnia/11.1.0","accept":"*/*","content-length":"31"}}
    requestId: "a86ae841-b7ed-45d0-a555-76e36a0b474a"
    type: "REQUEST"
[16:31:31.732] INFO (44079): {"rawBody":"<?xml version=\"1.0\" encoding=\"UTF-8\"?><Message>Hello world!</Message>","body":{"Message":"Hello world!"}}
    requestId: "a86ae841-b7ed-45d0-a555-76e36a0b474a"
    type: "RESPONSE"
```
