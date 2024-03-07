import { loadEnv } from './dotenv';
loadEnv();

import { App } from '@slack/bolt';
import { LogLevel } from '@slack/logger';
import { registerListeners } from './listeners';

const logLevel = process.env.SLACK_LOG_LEVEL as LogLevel || LogLevel.DEBUG;
const app = new App({
  socketMode: true,
  logLevel,
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
});

registerListeners(app);

(async () => {
  await app.start();
  console.log('⚡️ Bolt app is running!');
})();

