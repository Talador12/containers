/**
 * Example showing enhanced Container API usage
 * Demonstrates the new comprehensive configuration options added to existing Container class
 */

import { Container, getContainer } from '@cloudflare/containers';

interface Env {
  DATA_PROCESSOR: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      // EXAMPLE 1: Original Container API still works exactly the same
      const originalContainer = getContainer(env.DATA_PROCESSOR, 'original-task');
      await originalContainer.startAndWaitForPorts();
      const originalResponse = await originalContainer.containerFetch('/process');
      await originalContainer.destroy();

      // EXAMPLE 2: Enhanced Container API with runtime image override
      const enhancedContainer = getContainer(env.DATA_PROCESSOR, 'enhanced-task');
      const result = await enhancedContainer
        .withImage('docker-registry.cfdata.org/stash/enhanced-processor@sha256:abc123')
        .configure({
          env: {
            MODE: 'batch',
            LOG_LEVEL: 'debug'
          },
          resources: {
            memoryMiB: 1024,
            cpu: 1.0,
            timeoutMs: 300000
          },
          network: {
            allowEgress: false
          },
          retry: {
            maxAttempts: 3,
            strategy: 'exponential-backoff'
          }
        })
        .run({
          endpoint: {
            url: '/process',
            method: 'POST',
            body: { data: 'input-data' },
            headers: { 'Content-Type': 'application/json' }
          },
          destroyOnComplete: true
        });

      // EXAMPLE 3: Constructor with comprehensive options
      const configuredContainer = getContainer(env.DATA_PROCESSOR, 'configured-task', {
        image: 'docker-registry.cfdata.org/stash/data-transformer@sha256:def456',
        exec: '/usr/bin/transform',
        args: ['--input', 'data.csv', '--output', 'result.json'],
        env: {
          API_KEY: 'secret-key',
          DEBUG: 'true'
        },
        resources: {
          memoryMiB: 512,
          timeoutMs: 180000
        },
        captureOutput: true
      });

      const transformResult = await configuredContainer.run({
        autoStart: true,
        destroyOnComplete: true
      });

      // EXAMPLE 4: Batch processing with different configurations
      const batchResults = await Promise.all([
        getContainer(env.DATA_PROCESSOR, 'batch-1')
          .withImage('docker-registry.cfdata.org/stash/processor-a@sha256:aaa111')
          .run({
            endpoint: { url: '/analyze', method: 'POST', body: { type: 'quick' } }
          }),
        
        getContainer(env.DATA_PROCESSOR, 'batch-2')
          .withImage('docker-registry.cfdata.org/stash/processor-b@sha256:bbb222')
          .configure({
            resources: { memoryMiB: 2048, timeoutMs: 600000 }
          })
          .run({
            endpoint: { url: '/deep-analysis', method: 'POST', body: { type: 'thorough' } }
          })
      ]);

      return new Response(JSON.stringify({
        success: true,
        originalResult: await originalResponse.json(),
        enhancedResult: result.result,
        transformResult: transformResult.result,
        batchResults: batchResults.map(r => r.result)
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

/**
 * Example Durable Object Container class using enhanced options
 */
export class DataProcessor extends Container {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env, {
      // Enhanced configuration options available in constructor
      defaultPort: 8080,
      sleepAfter: '5m',
      resources: {
        memoryMiB: 1024,
        cpu: 0.5
      },
      security: {
        runAsUser: 1000,
        readOnlyRootFilesystem: true,
        privileged: false
      },
      network: {
        allowEgress: false
      },
      captureOutput: true
    });
  }
}

// Export for wrangler
export { DataProcessor };
