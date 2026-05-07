import { transitionStatusMapping } from "../../internals/stateAttributesMapping.js";
import { fieldValidityMapping } from "../../internals/field-constants/constants.js";
import { RadioRootDataAttributes } from "../root/RadioRootDataAttributes.js";
export const stateAttributesMapping = {
  checked(value) {
    if (value) {
      return {
        [RadioRootDataAttributes.checked]: ''
      };
    }
    return {
      [RadioRootDataAttributes.unchecked]: ''
    };
  },
  ...transitionStatusMapping,
  ...fieldValidityMapping
};