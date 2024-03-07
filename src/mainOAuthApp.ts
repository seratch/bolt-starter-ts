import { loadEnv } from './dotenv';
loadEnv();

import { App, FileInstallationStore, InstallURLOptions, StateStore, AuthorizationError } from '@slack/bolt';
import { LogLevel } from '@slack/logger';
import { registerListeners } from './listeners';

import jwt from 'jsonwebtoken';

class NotScalableStateStore implements StateStore {
  private stateSecret: string;
  private generatedStates: string[];

  constructor(stateSecret: string) {
    this.stateSecret = stateSecret;
    this.generatedStates = [];
  }
  async generateStateParam(installOptions: InstallURLOptions, now: Date): Promise<string> {
    const state = jwt.sign({ installOptions, createdAt: now.toJSON() }, this.stateSecret);
    this.generatedStates.push(state);
    return state;
  }

  async verifyStateParam(now: Date, state: string): Promise<InstallURLOptions> {
    const decoded = jwt.verify(state, this.stateSecret) as any;
    const createdAt = new Date(decoded.createdAt);
    if (now.getTime() - createdAt.getTime() > 600_000) {
      // TODO: make the second argument optional on the @slack/oauth side
      // TODO: expose other errors to 3rd party on the @slack/oauth side
      throw new AuthorizationError('The state value is too old', new Error());
    }
    const idx = this.generatedStates.indexOf(state);
    if (idx === -1) {
      // TODO: make the second argument optional on the @slack/oauth side
      // TODO: expose other errors to 3rd party on the @slack/oauth side
      throw new AuthorizationError('The state value is already expired', new Error());
    }
    this.generatedStates.splice(idx, 1);
    return decoded.installOptions;
  }
}

const processBeforeResponse = false;
const logLevel = process.env.SLACK_LOG_LEVEL as LogLevel || LogLevel.DEBUG;
const app = new App({
  logLevel,
  processBeforeResponse,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  scopes: ['chat:write', 'commands'],
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  installationStore: new FileInstallationStore({
    baseDir: './data',
    clientId: process.env.SLACK_CLIENT_ID,
    historicalDataEnabled: true,
  }),
  installerOptions: {
    stateStore: new NotScalableStateStore('my-secret'),
  }
});

registerListeners(app);

(async () => {
  await app.start(Number(process.env.PORT) || 3000);
  console.log('⚡️ Bolt app is running!');
})();

