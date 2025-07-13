import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "MCP for Remix" },
    { name: "description", content: "Model Context Protocol server with OAuth 2.0" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>MCP for Remix</h1>
      <p>Protocol is mounted below /.</p>
      <p>
        <a href="https://github.com/anthropics/claude-code">
          Learn more about Claude Code
        </a>
      </p>
    </div>
  );
}