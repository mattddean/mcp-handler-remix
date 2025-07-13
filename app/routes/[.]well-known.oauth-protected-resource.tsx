import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { protectedResourceHandler } from "mcp-handler";

const handler = protectedResourceHandler({
  // Specify the Issuer URL of the associated Authorization Server
  authServerUrls: ["http://localhost:3000"],
});

export const loader = ({ request }: LoaderFunctionArgs) => {
  return handler(request);
};

export const action = ({ request }: ActionFunctionArgs) => {
  if (request.method === "OPTIONS") {
    return handler(request);
  }
  throw new Response("Method not allowed", { status: 405 });
};
