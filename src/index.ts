import { loadEnv } from './dotenv';
loadEnv();

import { App } from '@slack/bolt';
import { LogLevel } from '@slack/logger';
import * as simpleModal from './simpleModal';
import * as simpleHomeTab from './simpleHomeTab';
import * as customMiddleware from './customMiddleware';

const processBeforeResponse = false;
const logLevel = process.env.SLACK_LOG_LEVEL as LogLevel || LogLevel.INFO;
const app = new App({
  logLevel,
  processBeforeResponse,
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

customMiddleware.enableAll(app);

app.command("/publish-home-tab", async ({ body, client, logger, context, ack }) => {
  const userId = body.user_id;
  try {
    await simpleHomeTab.publishHomeTab(client, userId);
    const response = await simpleHomeTab.buildNavigationMessageResponse(client, body.team_id, context.botId);
    await ack(response);
  } catch (e) {
    logger.error(`Failed to publish a view for user: ${userId} (response: ${JSON.stringify(e)})`, e)
    await ack(`:x: Failed to publish a modal (error: ${e.code})`);
  }
});

app.action({ type: "block_actions", action_id: "link-button" }, async ({ ack }) => {
  await ack();
});

app.shortcut("open-modal", async ({ body, client, logger, ack }) => {
  await ack();
  try {
    await simpleModal.openModal(client, body.trigger_id);
  } catch (e) {
    logger.error(`Failed to publish a view for user: (response: ${JSON.stringify(e)})`, e)
  }
});

app.view("request-modal", async ({ body, ack }) => {
  await simpleModal.notify(body);
  await ack();
});

(async () => {
  await app.start(Number(process.env.PORT) || 3000);
  console.log('⚡️ Bolt app is running!');
})();

