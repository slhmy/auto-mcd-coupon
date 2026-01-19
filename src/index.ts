#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { openrouter } from '@openrouter/ai-sdk-provider';
import { generateText, tool } from 'ai';
import { z } from 'zod';

// Configuration from environment variables
const MCD_MCP_TOKEN = process.env.MCD_MCP_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'qwen/qwen3-coder:free';

if (!MCD_MCP_TOKEN) {
  console.error('Error: MCD_MCP_TOKEN environment variable is required');
  process.exit(1);
}

if (!OPENROUTER_API_KEY) {
  console.error('Error: OPENROUTER_API_KEY environment variable is required');
  process.exit(1);
}

// Helper function to convert JSON Schema to Zod schema
function jsonSchemaToZod(schema: any): z.ZodType<any> {
  if (!schema || typeof schema !== 'object') {
    return z.any();
  }

  if (schema.type === 'object') {
    const shape: Record<string, z.ZodType<any>> = {};
    if (schema.properties) {
      for (const [key, value] of Object.entries(schema.properties)) {
        shape[key] = jsonSchemaToZod(value as any);
      }
    }
    return z.object(shape);
  }

  if (schema.type === 'string') {
    return z.string();
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    return z.number();
  }

  if (schema.type === 'boolean') {
    return z.boolean();
  }

  if (schema.type === 'array') {
    return z.array(schema.items ? jsonSchemaToZod(schema.items) : z.any());
  }

  return z.any();
}

async function main() {
  console.log('🍔 McDonald\'s Coupon Auto-Claim Starting...');
  console.log(`Using model: ${OPENROUTER_MODEL}`);

  // Initialize MCP client for McDonald's service
  const mcpClient = new Client({
    name: 'mcd-coupon-client',
    version: '1.0.0',
  }, {
    capabilities: {},
  });

  // Connect to MCD MCP service using StreamableHTTP transport
  const transport = new StreamableHTTPClientTransport(
    new URL('https://mcp.mcd.cn/mcp-servers/mcd-mcp'),
    {
      requestInit: {
        headers: {
          'Authorization': `Bearer ${MCD_MCP_TOKEN}`,
        },
      },
    }
  );

  console.log('Connecting to MCD MCP service...');
  await mcpClient.connect(transport);
  console.log('✅ Connected to MCD MCP service');

  // Get available tools from MCP
  const toolsList = await mcpClient.listTools();
  console.log(`Found ${toolsList.tools.length} tools available from MCD MCP:`);
  
  // Log available tools
  for (const mcpTool of toolsList.tools) {
    console.log(`  - ${mcpTool.name}: ${mcpTool.description || 'No description'}`);
  }

  // Convert MCP tools to AI SDK format
  const toolDefinitions: Record<string, any> = {};

  for (const mcpTool of toolsList.tools) {
    const zodSchema = jsonSchemaToZod(mcpTool.inputSchema);
    
    toolDefinitions[mcpTool.name] = tool({
      description: mcpTool.description || '',
      inputSchema: zodSchema,
      execute: async (args: Record<string, unknown>) => {
        console.log(`\n🔧 Executing tool: ${mcpTool.name}`);
        console.log(`   Args: ${JSON.stringify(args, null, 2)}`);
        
        const result = await mcpClient.callTool({
          name: mcpTool.name,
          arguments: args,
        });
        
        console.log(`   Result: ${JSON.stringify(result, null, 2)}`);
        return JSON.stringify(result);
      },
    });
  }

  // Use AI to claim coupons
  console.log('\n🤖 Asking AI to claim McDonald\'s coupons...');

  try {
    const result = await generateText({
      model: openrouter(OPENROUTER_MODEL),
      prompt: `You are an assistant that helps claim McDonald's coupons in China. 
      
Your task is to:
1. First, list all available McDonald's coupons
2. Then, claim all available coupons that you can
3. Report what coupons were successfully claimed with details

Please use the available MCP tools to accomplish this task. Be thorough and claim all coupons you can find.
Provide a summary at the end of what was accomplished.`,
      tools: toolDefinitions,
    });

    console.log('\n📋 AI Response:');
    console.log(result.text);

    console.log('\n✅ Coupon claiming process completed!');
    console.log(`Total steps taken: ${result.steps?.length || 0}`);
  } catch (error) {
    console.error('\n❌ Error during coupon claiming:', error);
    throw error;
  } finally {
    // Clean up
    await mcpClient.close();
    console.log('Disconnected from MCD MCP service');
  }
}

// Run the main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
