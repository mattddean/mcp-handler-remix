import {
  protectedResourceHandler,
  metadataCorsOptionsRequestHandler,
} from "mcp-handler";

const handler = protectedResourceHandler({
  // Specify the Issuer URL of the associated Authorization Server
  authServerUrls: ["http://localhost:3001"],
});

export { handler as GET, metadataCorsOptionsRequestHandler as OPTIONS };
