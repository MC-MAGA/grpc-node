/*
 *
 * Copyright 2025 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

var PROTO_PATH = __dirname + '/../protos/helloworld.proto';

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });
var hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;

var {deserializeGoogleGrpcStatusDetails, BadRequest} =
  require('@q42philips/node-grpc-error-details');

var client = new hello_proto.Greeter('localhost:50051', grpc.credentials.createInsecure());

function main() {
  // Successful call
  client.sayHello({name: 'World'}, function (err, response) {
    if (err) {
      console.error('Successful call failed:', err.message);
      return;
    }
    console.log('Greeting:', response.message);

    // Failing call with empty name
    client.sayHello({name: ''}, function (err, response) {
      if (err) {
        console.log('\n--- Standard gRPC Error Received ---');
        console.log('Code:', err.code);
        console.log('Status:', grpc.status[err.code] || 'UNKNOWN');
        console.log('Message:', err.details);

        // Deserialize rich error details
        var grpcErrorDetails = deserializeGoogleGrpcStatusDetails(err);
        if (grpcErrorDetails) {
          console.log('\n--- Rich Error Details---');
          grpcErrorDetails.details.forEach(function(detail) {
            if (detail instanceof BadRequest) {
              var violations = detail.getFieldViolationsList().map(function(violation) {
                return {
                  field: violation.getField(),
                  description: violation.getDescription()
                };
              });
              console.log('Violation:', JSON.stringify(violations, null, 2));
            }
          });
        }
      } else {
        console.log('Expected error but got success:', response.message);
      }
    });
  });
}

main();