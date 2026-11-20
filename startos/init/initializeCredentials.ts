import { utils } from '@start9labs/start-sdk'
import { setUiPassword } from '../actions/setUiPassword'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const initializeCredentials = sdk.setupOnInit(async (effects) => {
  const store = await storeJson.read().const(effects)

  if (!store?.bridgeAuthToken) {
    await storeJson.merge(
      effects,
      {
        bridgeAuthToken: utils.getDefaultString({
          charset: 'a-z,A-Z,0-9',
          len: 48,
        }),
      },
      { allowWriteAfterConst: true },
    )
  }

  if (!store?.uiPassword) {
    await sdk.action.createOwnTask(effects, setUiPassword, 'critical', {
      reason: i18n('Create the password for signing in to Chama'),
    })
  }
})
