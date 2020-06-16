import { WebClient } from '@slack/web-api';

export async function publishHomeTab(client: WebClient, userId: string) {
  await client.views.publish({
    user_id: userId,
    view: {
      "type": "home",
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "This is a mrkdwn section block :ghost: *this is bold*, and ~this is crossed out~, and <https://google.com|this is a link>"
          }
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `*Last updated:* ${new Date()}`
          }
        },
      ]
    }
  });
}

export async function buildNavigationMessageResponse(client: WebClient, teamId: string, botId: string) {
  const botsInfo = await client.bots.info({ bot: botId }) as any;
  const appId = botsInfo.bot.app_id;
  const url = `slack://app?team=${teamId}&id=${appId}&tab=home`;
  return {
    text: `:white_check_mark: Check the latest Home tab! <${url}|Go>`,
    blocks: [
      {
        "type": "section",
        "block_id": "home-tab-navigation",
        "text": {
          "type": "mrkdwn",
          "text": ":white_check_mark: Check the latest Home tab!"
        },
        "accessory": {
          "type": "button",
          "action_id": "link-button",
          "url": url,
          "style": "primary",
          "text": {
            "type": "plain_text",
            "text": "Go"
          }
        }
      }
    ]
  }
}