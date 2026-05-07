import { fieldValidityMapping } from "../../internals/field-constants/constants.js";
export const stateAttributesMapping = {
  inputValue: () => null,
  value: () => null,
  ...fieldValidityMapping
};