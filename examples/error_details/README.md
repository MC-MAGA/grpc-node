# Error Details

This example demonstrates how to send and receive rich error details in gRPC using the standard `google.rpc` error model.

## Overview

The example uses the `@q42philips/node-grpc-error-details` package to:
- **Server**: Serialize error details (like `BadRequest`) into the `grpc-status-details-bin` metadata
- **Client**: Deserialize error details from the metadata

This follows the official gRPC error model specification.

## Start the server

Run the server, which sends a rich error if the name field is empty:

```bash
node server.js
```

## Run the client

In another terminal, run the client which makes two calls:
1. A successful call with a valid name
2. A failing call with an empty name that receives rich error details

```bash
node client.js
```

## Expected Output

The client makes two calls and displays both results:

**Successful call:**
```
Greeting: Hello World
```

**Failed call with standard error and rich error details:**
```
--- Standard gRPC Error Received ---
Code: 3
Status: INVALID_ARGUMENT
Message: Simple Error: The name field was empty.

--- Rich Error Details---
Violation: [
  {
    "field": "name",
    "description": "Name field is required"
  }
]
```
