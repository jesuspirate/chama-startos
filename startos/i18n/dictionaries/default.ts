export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Chama': 0,
  '${client} is not ready yet': 3,
  "${client}'s wallet bridge is not ready yet": 4,

  // interfaces.ts
  'Wallet Bridge Status': 9,
  'Not responding': 12,
  Federation: 13,
  Joined: 14,
  'Not joined yet': 15,
  'Relay discovery': 16,
  Reachable: 17,
  Degraded: 18,
  'Still probing': 19,
  'Not configured': 20,
  Unknown: 21,
  Chama: 22,
  'Web App': 23,
  'Chama is ready': 24,
  'Your self-hosted Chama marketplace with a native Fedimint wallet': 25,
  "Report the federation and relay discovery state of Chama's native Fedimint wallet": 26,
  'Chama holds ecash only once you have joined a federation inside the app.': 27,

  // actions/setUiPassword.ts, init/initializeCredentials.ts
  'Create UI Password': 28,
  'Reset UI Password': 29,
  'Generate the password for signing in to Chama': 30,
  'Generate a new password for signing in to Chama': 31,
  'Replaces the current Chama password.': 32,
  'Chama Sign-In': 33,
  'Your browser asks for these when you open Chama. Save them to a password manager.': 34,
  Username: 35,
  Password: 36,
  'Create the password for signing in to Chama': 37,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
