import { sdk } from '../sdk'
import { setUiPassword } from './setUiPassword'
import { walletStatus } from './walletStatus'

export const actions = sdk.Actions.of()
  .addAction(setUiPassword)
  .addAction(walletStatus)
