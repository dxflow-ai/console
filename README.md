# dxflow console

The dxflow web console — manage and monitor your workflows, engines, and resources from one place.

The console is the interface served by the dxflow engine. Launch your engine and open it in the browser to:

- Create, run, and track workflows
- Browse and run templates from the hub
- Inspect and edit generated artifacts
- Open interactive engine shells
- Build and operate workflows in natural language with the AI agent

Learn more at [dxflow.ai](https://dxflow.ai) · Documentation: [dxflow.ai/docs](https://dxflow.ai/docs)

## Development

`make dev` serves the console on `http://localhost:4545` and proxies `/api/` — HTTP and WebSocket alike — to an engine on port 80, so boot an engine first and sign in against it.

## Releases

The console is released automatically in lockstep with the engine — there is no
manual publish step here. To preview a production build locally, run `pnpm generate`.
