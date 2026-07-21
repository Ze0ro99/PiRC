import { fieldValidityMapping } from "../../internals/field-constants/constants.js";
export const rootStateAttributesMapping = {
  value: () => null,
  length: () => null,
  ...fieldValidityMapping
};
export const inputStateAttributesMapping = {
  value: () => null,
  index: () => null,
  ...fieldValidityMapping
};