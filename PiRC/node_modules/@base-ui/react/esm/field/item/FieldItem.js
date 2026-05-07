'use client';

import * as React from 'react';
import { useFieldRootContext } from "../../internals/field-root-context/FieldRootContext.js";
import { fieldValidityMapping } from "../../internals/field-constants/constants.js";
import { useRenderElement } from "../../internals/useRenderElement.js";
import { FieldItemContext } from "./FieldItemContext.js";
import { LabelableProvider } from "../../internals/labelable-provider/index.js";
import { useCheckboxGroupContext } from "../../checkbox-group/CheckboxGroupContext.js";

/**
 * Groups individual items in a checkbox group or radio group with a label and description.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Field](https://base-ui.com/react/components/field)
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const FieldItem = /*#__PURE__*/React.forwardRef(function FieldItem(componentProps, forwardedRef) {
  const {
    render,
    className,
    style,
    disabled: disabledProp = false,
    ...elementProps
  } = componentProps;
  const {
    state,
    disabled: rootDisabled
  } = useFieldRootContext(false);
  const disabled = rootDisabled || disabledProp;
  const checkboxGroupContext = useCheckboxGroupContext();
  // checkboxGroupContext.parent is truthy even if no parent checkbox is involved
  const parentId = checkboxGroupContext?.parent.id;
  // this a more reliable check
  const hasParentCheckbox = checkboxGroupContext?.allValues !== undefined;
  const controlId = hasParentCheckbox ? parentId : undefined;
  const fieldItemContext = React.useMemo(() => ({
    disabled
  }), [disabled]);
  const element = useRenderElement('div', componentProps, {
    ref: forwardedRef,
    state,
    props: elementProps,
    stateAttributesMapping: fieldValidityMapping
  });
  return /*#__PURE__*/_jsx(LabelableProvider, {
    controlId: controlId,
    children: /*#__PURE__*/_jsx(FieldItemContext.Provider, {
      value: fieldItemContext,
      children: element
    })
  });
});
if (process.env.NODE_ENV !== "production") FieldItem.displayName = "FieldItem";