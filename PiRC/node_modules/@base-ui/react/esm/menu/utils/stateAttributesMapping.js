import { transitionStatusMapping } from "../../internals/stateAttributesMapping.js";
import { MenuCheckboxItemDataAttributes } from "../checkbox-item/MenuCheckboxItemDataAttributes.js";
export const itemMapping = {
  checked(value) {
    if (value) {
      return {
        [MenuCheckboxItemDataAttributes.checked]: ''
      };
    }
    return {
      [MenuCheckboxItemDataAttributes.unchecked]: ''
    };
  },
  ...transitionStatusMapping
};