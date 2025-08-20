# Container Examples

This directory contains examples demonstrating different Container API usage patterns.

## Examples

### `basic-typescript/`
Basic TypeScript container example showing traditional Container API usage with TypeScript.

### `basic-nodejs/` 
Basic Node.js container example showing traditional Container API usage with Node.js.

### `enhanced-api/`
Enhanced Container API examples demonstrating the new comprehensive configuration options:
- Runtime image override
- Chainable configuration methods
- Comprehensive single-call execution
- Resource limits and retry logic

## Running Examples

Each example directory contains its own `wrangler.jsonc` configuration and can be deployed independently:

```bash
cd examples/basic-typescript
npm install
wrangler deploy

cd ../basic-nodejs  
npm install
wrangler deploy

cd ../enhanced-api
# Copy files to a worker directory for deployment
```

## API Evolution

- **basic-typescript/basic-nodejs**: Traditional Container API (fully supported)
- **enhanced-api**: Extended Container API with comprehensive configuration matching `step.container()` UX
