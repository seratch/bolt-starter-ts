import { App } from '@slack/bolt';
import * as simpleModal from './simpleModal';
import * as simpleHomeTab from './simpleHomeTab';
import * as customMiddleware from './customMiddleware';

export function registerListeners(app: App) {

  customMiddleware.enableAll(app);

  app.command("/publish-home-tab", async ({ body, client, logger, context, ack }) => {
    const userId = body.user_id;
    try {
      await simpleHomeTab.publishHomeTab(client, userId);
      const response = await simpleHomeTab.buildNavigationMessageResponse(client, body.team_id, context.botId!!);
      await ack(response);
    } catch (e: any) {
      logger.error(`Failed to publish a view for user: ${userId} (response: ${JSON.stringify(e)})`, e);
      await ack(`:x: Failed to publish a modal (error: ${e.code})`);
    }
  });

  app.event("app_home_opened", async ({ event, client, logger, context }) => {
    if (event.tab === "home") {
      const userId = context.userId!;
      try {
        await simpleHomeTab.publishHomeTab(client, userId);
      } catch (e: any) {
        logger.error(`Failed to publish a view for user: ${userId} (response: ${JSON.stringify(e)})`, e);
      }
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
}
