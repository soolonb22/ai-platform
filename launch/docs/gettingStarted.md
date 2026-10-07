# Getting started

Signup is not live in this build. There is no account store.

To try a workflow locally:

1. Open a tool page: Trauma, NDIS, School, or Evidence.
2. Paste a note, or load a text file. PDF text extract is not in this layer.
3. Run the workflow. The runner redacts first, then calls the engine.
4. Read the draft. It is not a diagnosis and not a funding decision.

The first local call can also be `handleRequest("/trauma", { input })` from `integration/api/apiRouter.ts`. Empty input returns "No input to process."
