'use client';

import * as React from 'react';
import { useRenderElement } from "../../internals/useRenderElement.js";
import { useButton } from "../../internals/use-button/index.js";
import { useNumberFieldRootContext } from "../root/NumberFieldRootContext.js";
import { useNumberFieldButton } from "../root/useNumberFieldButton.js";
import { stateAttributesMapping } from "../utils/stateAttributesMapping.js";

/**
 * A stepper button that increases the field value when clicked.
 * Renders an `<button>` element.
 *
 * Documentation: [Base UI Number Field](https://base-ui.com/react/components/number-field)
 */
export const NumberFieldIncrement = /*#__PURE__*/React.forwardRef(function NumberFieldIncrement(componentProps, forwardedRef) {
  const {
    render,
    className,
    disabled: disabledProp = false,
    nativeButton = true,
    style,
    ...elementProps
  } = componentProps;
  const {
    allowInputSyncRef,
    disabled: contextDisabled,
    formatOptionsRef,
    getStepAmount,
    id,
    incrementValue,
    inputRef,
    inputValue,
    locale,
    maxWithDefault,
    readOnly,
    setValue,
    state,
    value,
    valueRef,
    lastChangedValueRef,
    onValueCommitted
  } = useNumberFieldRootContext();
  const isMax = value != null && value >= maxWithDefault;
  const disabled = disabledProp || contextDisabled || isMax;
  const props = useNumberFieldButton({
    isIncrement: true,
    inputRef,
    inputValue,
    disabled,
    readOnly,
    id,
    setValue,
    getStepAmount,
    incrementValue,
    allowInputSyncRef,
    formatOptionsRef,
    valueRef,
    locale,
    lastChangedValueRef,
    onValueCommitted
  });
  const {
    getButtonProps,
    buttonRef
  } = useButton({
    disabled,
    native: nativeButton,
    focusableWhenDisabled: true
  });
  const buttonState = React.useMemo(() => ({
    ...state,
    disabled
  }), [state, disabled]);
  const element = useRenderElement('button', componentProps, {
    ref: [forwardedRef, buttonRef],
    state: buttonState,
    props: [props, elementProps, getButtonProps],
    stateAttributesMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") NumberFieldIncrement.displayName = "NumberFieldIncrement";