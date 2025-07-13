import {
  protectedResourceHandler,
  metadataCorsOptionsRequestHandler,
} from "mcp-handler";

const authODomain = "claimvoyance-dev.us.auth0.com";

const handler = protectedResourceHandler({
  // Specify the Issuer URL of the associated Authorization Server
  // authServerUrls: [`https://${authODomain}`],
  authServerUrls: ["http://localhost:3001"],
});

export { handler as GET, metadataCorsOptionsRequestHandler as OPTIONS };
