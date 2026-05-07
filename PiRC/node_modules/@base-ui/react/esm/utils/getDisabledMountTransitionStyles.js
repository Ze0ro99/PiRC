import { EMPTY_OBJECT } from '@base-ui/utils/empty';
import { DISABLED_TRANSITIONS_STYLE } from "../internals/constants.js";
export function getDisabledMountTransitionStyles(transitionStatus) {
  return transitionStatus === 'starting' ? DISABLED_TRANSITIONS_STYLE : EMPTY_OBJECT;
}