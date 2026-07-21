"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OTPFieldInput = void 0;
var React = _interopRequireWildcard(require("react"));
var _safeReact = require("@base-ui/utils/safeReact");
var _warn = require("@base-ui/utils/warn");
var _utils = require("../../floating-ui-react/utils");
var _useCompositeListItem = require("../../internals/composite/list/useCompositeListItem");
var _useRenderElement = require("../../internals/useRenderElement");
var _createBaseUIEventDetails = require("../../internals/createBaseUIEventDetails");
var _reasons = require("../../internals/reasons");
var _OTPFieldRootContext = require("../root/OTPFieldRootContext");
var _stateAttributesMapping = require("../utils/stateAttributesMapping");
var _otp = require("../utils/otp");
/**
 * An individual OTP character input.
 * Renders an `<input>` element.
 *
 * Documentation: [Base UI OTP Field](https://base-ui.com/react/components/otp-field)
 */
const OTPFieldInput = exports.OTPFieldInput = /*#__PURE__*/React.forwardRef(function OTPFieldInput(componentProps, forwardedRef) {
  const {
    'aria-label': externalAriaLabel,
    'aria-labelledby': externalAriaLabelledBy,
    render,
    className,
    style,
    ...elementProps
  } = componentProps;
  const {
    activeIndex,
    autoComplete,
    disabled,
    form,
    focusInput,
    queueFocusInput,
    getInputId,
    handleInputBlur,
    handleInputFocus,
    inputMode,
    inputAriaLabelledBy,
    invalid,
    length,
    mask,
    pattern,
    reportValueInvalid,
    readOnly,
    required,
    sanitizeValue,
    setValue,
    state,
    validationType,
    value
  } = (0, _OTPFieldRootContext.useOTPFieldRootContext)();
  const {
    ref: listItemRef,
    index
  } = (0, _useCompositeListItem.useCompositeListItem)({
    indexGuessBehavior: _useCompositeListItem.IndexGuessBehavior.GuessFromOrder
  });
  const inputRef = React.useRef(null);
  const slotValue = value[index] ?? '';
  const inputState = (0, _OTPFieldRootContext.getOTPFieldInputState)(state, slotValue, index);
  const slotAriaLabel = externalAriaLabel;
  const inheritedLabel = externalAriaLabelledBy ?? inputAriaLabelledBy;
  const ariaLabel = index === 0 ? undefined : slotAriaLabel;
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      if (index !== 0 || slotAriaLabel == null || inputRef.current?.labels?.length) {
        return;
      }
      const ownerStackMessage = _safeReact.SafeReact.captureOwnerStack?.() || '';
      (0, _warn.warn)('<OTPField.Input> ignores `aria-label` on the first input. Use a `<label>` or `<Field.Label>` to label the OTP field.', ownerStackMessage);
    }, [index, slotAriaLabel]);
  }
  const inputProps = {
    id: getInputId(index),
    value: slotValue,
    type: mask ? 'password' : 'text',
    inputMode,
    autoComplete: index === 0 ? autoComplete : 'off',
    autoCorrect: 'off',
    spellCheck: 'false',
    enterKeyHint: index === length - 1 ? 'done' : 'next',
    // Allow the first slot to accept a full code so browser paste/autofill can target it directly.
    maxLength: index === 0 ? length : 1,
    tabIndex: activeIndex === index ? 0 : -1,
    disabled,
    form,
    pattern,
    readOnly,
    required,
    'aria-labelledby': ariaLabel == null ? inheritedLabel : undefined,
    'aria-invalid': invalid || undefined,
    'aria-label': ariaLabel,
    onMouseDown(event) {
      if (event.defaultPrevented || disabled) {
        return;
      }
      event.preventDefault();
      focusInput(index);
    },
    onFocus(event) {
      if (event.defaultPrevented || disabled) {
        return;
      }
      handleInputFocus(index, event);
    },
    onBlur(event) {
      if (event.defaultPrevented) {
        return;
      }
      handleInputBlur(event);
    },
    onChange(event) {
      if (event.defaultPrevented || disabled || readOnly) {
        return;
      }
      const rawValue = event.currentTarget.value;
      const nextDigits = (0, _otp.normalizeOTPValue)(event.currentTarget.value, length, validationType, sanitizeValue);
      const didSanitize = (0, _otp.stripOTPWhitespace)(rawValue).length > nextDigits.length;
      if (didSanitize) {
        reportValueInvalid(rawValue, (0, _createBaseUIEventDetails.createGenericEventDetails)(_reasons.REASONS.inputChange, event.nativeEvent));
      }
      if (nextDigits === '') {
        if (rawValue === '') {
          setValue((0, _otp.removeOTPCharacter)(value, index), (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.inputClear, event.nativeEvent));
        } else if (slotValue !== '') {
          event.currentTarget.value = slotValue;
          event.currentTarget.select();
        }
        return;
      }
      const nextValue = (0, _otp.replaceOTPValue)(value, index, nextDigits, length, validationType, sanitizeValue);
      const committedValue = setValue(nextValue, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.inputChange, event.nativeEvent));
      if (committedValue != null) {
        const nextInput = Math.min(index + nextDigits.length, length - 1);
        queueFocusInput(nextInput, committedValue);
      }
    },
    onKeyDown(event) {
      if (event.defaultPrevented || disabled) {
        return;
      }
      if (event.key === 'ArrowLeft') {
        (0, _utils.stopEvent)(event);
        focusInput(Math.max(0, index - 1));
        return;
      }
      if (event.key === 'ArrowRight') {
        (0, _utils.stopEvent)(event);
        focusInput(Math.min(length - 1, index + 1));
        return;
      }
      if (event.key === 'Home') {
        (0, _utils.stopEvent)(event);
        focusInput(0);
        return;
      }
      if (event.key === 'End') {
        (0, _utils.stopEvent)(event);
        focusInput(Math.max(value.length - 1, 0));
        return;
      }
      if (readOnly) {
        return;
      }
      if (event.key === 'Delete') {
        (0, _utils.stopEvent)(event);
        const committedValue = setValue((0, _otp.removeOTPCharacter)(value, index), (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.keyboard, event.nativeEvent));
        if (committedValue != null) {
          queueFocusInput(index, committedValue);
        }
        return;
      }
      const inputValue = event.currentTarget.value;
      const fullSelection = event.currentTarget.selectionStart === 0 && event.currentTarget.selectionEnd === inputValue.length;
      if (event.key.length === 1 && fullSelection && slotValue === event.key) {
        (0, _utils.stopEvent)(event);
        focusInput(Math.min(length - 1, index + 1));
        return;
      }
      if (event.key === 'Backspace') {
        (0, _utils.stopEvent)(event);
        const deleteIndex = slotValue === '' ? Math.max(0, index - 1) : index;
        const targetIndex = Math.max(0, index - 1);
        const committedValue = setValue((0, _otp.removeOTPCharacter)(value, deleteIndex), (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.keyboard, event.nativeEvent));
        if (committedValue != null) {
          queueFocusInput(targetIndex, committedValue);
        }
      }
    },
    onPaste(event) {
      if (event.defaultPrevented || disabled || readOnly) {
        return;
      }
      let rawValue = '';
      try {
        rawValue = event.clipboardData?.getData('text/plain') ?? '';
      } catch {
        if (process.env.NODE_ENV !== 'production') {
          const ownerStackMessage = _safeReact.SafeReact.captureOwnerStack?.() || '';
          (0, _warn.warn)('<OTPField.Input> could not read clipboard text during paste handling.', ownerStackMessage);
        }
        return;
      }
      event.preventDefault();
      const nextDigits = (0, _otp.normalizeOTPValue)(rawValue, length, validationType, sanitizeValue);
      const didSanitize = (0, _otp.stripOTPWhitespace)(rawValue).length > nextDigits.length;
      if (didSanitize) {
        reportValueInvalid(rawValue, (0, _createBaseUIEventDetails.createGenericEventDetails)(_reasons.REASONS.inputPaste, event.nativeEvent));
      }
      if (nextDigits === '') {
        return;
      }
      const committedValue = setValue((0, _otp.replaceOTPValue)(value, index, nextDigits, length, validationType, sanitizeValue), (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.inputPaste, event.nativeEvent));
      if (committedValue != null) {
        const nextInput = Math.min(index + nextDigits.length, length - 1);
        queueFocusInput(nextInput, committedValue);
      }
    }
  };
  const element = (0, _useRenderElement.useRenderElement)('input', componentProps, {
    ref: [forwardedRef, listItemRef, inputRef],
    state: inputState,
    props: [inputProps, elementProps],
    stateAttributesMapping: _stateAttributesMapping.inputStateAttributesMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") OTPFieldInput.displayName = "OTPFieldInput";