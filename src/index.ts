#!/usr/bin/env node

import 'dotenv/config';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
// Configuration from environment variables
const MCD_MCP_TOKEN = process.env.MCD_MCP_TOKEN;

if (!MCD_MCP_TOKEN) {
  console.error('Error: MCD_MCP_TOKEN environment variable is required');
  process.exit(1);
}

async function main() {
  console.log('🍔 McDonald\'s Coupon Auto-Claim Starting...');

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

  try {
    const autoBindTool = toolsList.tools.find((mcpTool) => mcpTool.name === 'auto-bind-coupons');

    if (!autoBindTool) {
      const availableTools = toolsList.tools.map((tool) => tool.name).join(', ');
      throw new Error(`Required tool "auto-bind-coupons" not found. Available tools: ${availableTools}`);
    }

    console.log('\n🎟️ Claiming all available coupons via auto-bind-coupons...');
    const result = await mcpClient.callTool({
      name: 'auto-bind-coupons',
      arguments: {},
    });

    console.log('\n📋 Coupon claim result:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n✅ Coupon claiming process completed!');
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
