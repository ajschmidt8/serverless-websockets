import { APIGatewayProxyWebsocketHandlerV2 } from "aws-lambda";
import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";

const hello: APIGatewayProxyWebsocketHandlerV2 = async () => {
  return {
    statusCode: 200,
    body: "Hello, from default route!",
  };
};

const replies: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const domain = event.requestContext.domainName;
  const stage = event.requestContext.stage;
  const connectionId = event.requestContext.connectionId;
  const callbackUrlForAWS = `https://${domain}/${stage}`;
  const client = new ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: callbackUrlForAWS,
  });

  const sendMessage = (message: string) =>
    client.postToConnection({
      ConnectionId: connectionId,
      Data: Buffer.from(
        JSON.stringify({
          message,
        })
      ),
    });

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  for (let i = 0; i < 3; i++) {
    await sendMessage(`replying... loop: ${i}`);
    await delay(1000);
  }

  return {
    statusCode: 200,
  };
};

module.exports = {
  hello,
  replies,
};
