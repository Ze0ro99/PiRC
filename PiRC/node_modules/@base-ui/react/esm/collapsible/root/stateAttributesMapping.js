import { collapsibleOpenStateMapping as baseMapping } from "../../utils/collapsibleOpenStateMapping.js";
import { transitionStatusMapping } from "../../internals/stateAttributesMapping.js";
export const collapsibleStateAttributesMapping = {
  ...baseMapping,
  ...transitionStatusMapping
};