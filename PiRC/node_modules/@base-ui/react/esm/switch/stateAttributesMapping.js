import { fieldValidityMapping } from "../internals/field-constants/constants.js";
import { SwitchRootDataAttributes } from "./root/SwitchRootDataAttributes.js";
export const stateAttributesMapping = {
  ...fieldValidityMapping,
  checked(value) {
    if (value) {
      return {
        [SwitchRootDataAttributes.checked]: ''
      };
    }
    return {
      [SwitchRootDataAttributes.unchecked]: ''
    };
  }
};