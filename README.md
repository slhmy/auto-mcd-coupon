# auto-mcd-coupon

Automatically claim McDonald's China coupons using AI and MCP (Model Context Protocol).

This project uses:
- **Node.js** with TypeScript
- **Vercel AI SDK** for AI integration
- **OpenRouter** for free AI model access
- **McDonald's MCP Service** for coupon management
- **GitHub Actions** for automated daily/weekly execution

## Features

- 🤖 AI-powered coupon claiming using OpenRouter's free models
- 🍔 Integrates with McDonald's China MCP service
- ⏰ Automated daily and weekly GitHub Actions workflow
- 🔒 Secure secret management via GitHub Secrets
- 📊 Detailed logging and error handling

## Setup

### Prerequisites

1. **McDonald's MCP Token**: 
   - Visit [open.mcd.cn/mcp](https://open.mcd.cn/mcp)
   - Log in with your mobile phone number
   - Click "控制台" (Console)
   - Click "激活" (Activate) to get your MCP token

2. **OpenRouter API Key**:
   - Sign up at [openrouter.ai](https://openrouter.ai)
   - Get your API key from the dashboard

### GitHub Secrets Configuration

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions → New repository secret):

1. **`MCD_MCP_TOKEN`**: Your McDonald's MCP token
2. **`OPENROUTER_API_KEY`**: Your OpenRouter API key

### GitHub Variables Configuration (Optional)

Add the following variable to your GitHub repository (Settings → Secrets and variables → Actions → Variables):

1. **`OPENROUTER_MODEL`**: The OpenRouter model to use (default: `google/gemini-2.0-flash-exp:free`)
   - Other free options: `meta-llama/llama-3.2-3b-instruct:free`, `qwen/qwen-2-7b-instruct:free`

## Local Development

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run the coupon claim script
npm start
```

### Development Mode

```bash
# Run without building (using tsx)
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:

```bash
MCD_MCP_TOKEN=your_mcd_token_here
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
```

## GitHub Actions

The workflow runs automatically:
- **Weekly**: Every Monday at 11:00 AM Beijing Time (3:00 AM UTC)

You can also trigger it manually:
1. Go to "Actions" tab in your repository
2. Select "Auto Claim McDonald's Coupons" workflow
3. Click "Run workflow"

## How It Works

1. **Connects to McDonald's MCP service** using your MCP token
2. **Lists available tools** from the MCP service (coupon listing, claiming, etc.)
3. **Uses AI** (via OpenRouter) to intelligently:
   - Query available coupons
   - Claim all available coupons
   - Report results
4. **Logs the process** for transparency and debugging

## Troubleshooting

### Rate Limits
- McDonald's MCP service supports up to 600 requests per minute
- If you hit rate limits, the service returns a 429 error

### Failed Claims
- Check the Actions tab for workflow logs
- Failed runs upload logs as artifacts for 7 days

### Connection Issues
- Verify your MCD_MCP_TOKEN is valid
- Ensure your OPENROUTER_API_KEY is active
- Check if the McDonald's MCP service is online

## License

MIT

## Disclaimer

This project is for educational purposes. Use responsibly and in accordance with McDonald's terms of service.