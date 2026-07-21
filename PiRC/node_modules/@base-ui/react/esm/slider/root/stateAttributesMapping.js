import { fieldValidityMapping } from "../../internals/field-constants/constants.js";
export const sliderStateAttributesMapping = {
  activeThumbIndex: () => null,
  max: () => null,
  min: () => null,
  minStepsBetweenValues: () => null,
  step: () => null,
  values: () => null,
  ...fieldValidityMapping
};