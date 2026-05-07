import { pressableTriggerOpenStateMapping } from "../../utils/popupStateMapping.js";
import { fieldValidityMapping } from "../../internals/field-constants/constants.js";
export const triggerStateAttributesMapping = {
  ...pressableTriggerOpenStateMapping,
  ...fieldValidityMapping,
  popupSide: side => side ? {
    'data-popup-side': side
  } : null,
  listEmpty: empty => empty ? {
    'data-list-empty': ''
  } : null
};