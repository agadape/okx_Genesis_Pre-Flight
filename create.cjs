const { execFileSync } = require('child_process');
try {
  const output = execFileSync('onchainos', [
    'agent',
    'create',
    '--role', 'asp',
    '--name', 'Pre-Flight',
    '--description', 'Trust and Safety scanner for ASPs and Skills on OKX AI. Evaluates risk based on marketplace rating, liveness, and code transparency.',
    '--picture', 'https://static.okx.com/cdn/web3/wallet/marketplace/headimages/agent/avatar/7ca4533e-c99a-41fd-b606-71272d7d8e44.png',
    '--service', '[{"serviceName":"preflight-scan","serviceDescription":"Scan an ASP or Skill for trust and safety risk signals.\\nRequire: Target ASP/Skill ID.","serviceType":"A2MCP","fee":"0.05","endpoint":"https://okx-genesis-pre-flight.vercel.app/scan"}]'
  ], { encoding: 'utf8' });
  console.log(output);
} catch (e) {
  console.log(e.stdout || e.stderr || e);
}
