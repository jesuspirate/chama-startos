import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { uiUsername } from '../utils'

export const setUiPassword = sdk.Action.withoutInput(
  'set-ui-password',

  async ({ effects }) => {
    const isSet = !!(await storeJson.read((s) => s.uiPassword).const(effects))
    return {
      name: isSet ? i18n('Reset UI Password') : i18n('Create UI Password'),
      description: isSet
        ? i18n('Generate a new password for signing in to Chama')
        : i18n('Generate the password for signing in to Chama'),
      warning: isSet ? i18n('Replaces the current Chama password.') : null,
      allowedStatuses: 'any',
      group: null,
      visibility: 'enabled',
    }
  },

  async ({ effects }) => {
    const password = utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 32,
    })
    await storeJson.merge(effects, { uiPassword: password })

    return {
      version: '1',
      title: i18n('Chama Sign-In'),
      message: i18n(
        'Your browser asks for these when you open Chama. Save them to a password manager.',
      ),
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: i18n('Username'),
            description: null,
            value: uiUsername,
            masked: false,
            copyable: true,
            qr: false,
            launchable: false,
          },
          {
            type: 'single',
            name: i18n('Password'),
            description: null,
            value: password,
            masked: true,
            copyable: true,
            qr: false,
            launchable: false,
          },
        ],
      },
    }
  },
)
