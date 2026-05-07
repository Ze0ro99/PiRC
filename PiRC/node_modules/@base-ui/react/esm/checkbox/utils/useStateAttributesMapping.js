'use client';

import * as React from 'react';
import { CheckboxRootDataAttributes } from "../root/CheckboxRootDataAttributes.js";
import { fieldValidityMapping } from "../../internals/field-constants/constants.js";
export function useStateAttributesMapping(state) {
  return React.useMemo(() => ({
    checked(value) {
      if (state.indeterminate) {
        // `data-indeterminate` is already handled by the `indeterminate` prop.
        return {};
      }
      if (value) {
        return {
          [CheckboxRootDataAttributes.checked]: ''
        };
      }
      return {
        [CheckboxRootDataAttributes.unchecked]: ''
      };
    },
    ...fieldValidityMapping
  }), [state.indeterminate]);
}