import { loadEnv } from './dotenv';
loadEnv();

import { App } from '@slack/bolt';
import { LogLevel } from '@slack/logger';
import { registerListeners } from './listeners';

const processBeforeResponse = false;
const logLevel = process.env.SLACK_LOG_LEVEL as LogLevel || LogLevel.INFO;
const app = new App({
  logLevel,
  processBeforeResponse,
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

registerListeners(app);

(async () => {
  await app.start(Number(process.env.PORT) || 3000);
  console.log('⚡️ Bolt app is running!');
})();

