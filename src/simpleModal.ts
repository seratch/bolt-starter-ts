import { WebClient } from '@slack/web-api';
import axios from 'axios';

export async function openModal(client: WebClient, triggerId: string) {
  await client.views.open({
    trigger_id: triggerId,
    view: {
      "type": "modal",
      "callback_id": "request-modal",
      "submit": {
        "type": "plain_text",
        "text": "Submit",
        "emoji": true
      },
      "close": {
        "type": "plain_text",
        "text": "Cancel",
        "emoji": true
      },
      "title": {
        "type": "plain_text",
        "text": "Request",
        "emoji": true
      },
      "blocks": [
        {
          "type": "input",
          "element": {
            "type": "plain_text_input"
          },
          "label": {
            "type": "plain_text",
            "text": "Title"
          }
        },
        {
          "type": "input",
          "element": {
            "type": "plain_text_input",
            "multiline": true
          },
          "label": {
            "type": "plain_text",
            "text": "Description"
          },
          "optional": true
        },
        {
          "type": "input",
          "element": {
            "type": "datepicker",
            "placeholder": {
              "type": "plain_text",
              "text": "Select a date"
            }
          },
          "label": {
            "type": "plain_text",
            "text": "Deadline",
            "emoji": true
          },
          "optional": true
        },
        {
          "type": "input",
          "element": {
            "type": "conversations_select",
            "default_to_current_conversation": true,
            "response_url_enabled": true
          },
          "label": {
            "type": "plain_text",
            "text": "Notification"
          }
        }
      ]
    }
  });
}

export async function notify(body: any) {
  // TODO: respond should be supported by Bolt
  const responseUrls = (body as any).response_urls;
  if (responseUrls && responseUrls.length > 0) {
    const url = responseUrls[0].response_url;
    await axios.post(url, { text: "```" + JSON.stringify(body.view.state.values) + "```" });
  }
}