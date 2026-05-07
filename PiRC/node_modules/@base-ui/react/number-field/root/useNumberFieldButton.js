"use strict";
'use client';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useNumberFieldButton = useNumberFieldButton;
var _usePressAndHold = require("../../internals/usePressAndHold");
var _constants = require("../utils/constants");
var _parse = require("../utils/parse");
var _createBaseUIEventDetails = require("../../internals/createBaseUIEventDetails");
var _reasons = require("../../internals/reasons");
// Treat pen as touch-like to avoid forcing the software keyboard on stylus taps.
// Linux Chrome may emit "pen" historically for mouse usage due to a bug, but the touch path
// still works with minor behavioral differences.
function isTouchLikePointerType(pointerType) {
  return pointerType === 'touch' || pointerType === 'pen';
}
function useNumberFieldButton(params) {
  const {
    allowInputSyncRef,
    disabled,
    formatOptionsRef,
    getStepAmount,
    id,
    incrementValue,
    inputRef,
    inputValue,
    isIncrement,
    locale,
    readOnly,
    setValue,
    valueRef,
    lastChangedValueRef,
    onValueCommitted
  } = params;
  const pressReason = isIncrement ? _reasons.REASONS.incrementPress : _reasons.REASONS.decrementPress;
  function commitValue(nativeEvent) {
    allowInputSyncRef.current = true;

    // The input may be dirty but not yet blurred, so the value won't have been committed.
    const parsedValue = (0, _parse.parseNumber)(inputValue, locale, formatOptionsRef.current);
    if (parsedValue !== null) {
      // The increment value function needs to know the current input value to increment it
      // correctly.
      valueRef.current = parsedValue;
      setValue(parsedValue, (0, _createBaseUIEventDetails.createChangeEventDetails)(pressReason, nativeEvent, undefined, {
        direction: isIncrement ? 1 : -1
      }));
    }
  }
  const {
    pointerHandlers,
    shouldSkipClick
  } = (0, _usePressAndHold.usePressAndHold)({
    disabled: disabled || readOnly,
    elementRef: inputRef,
    tickDelay: _constants.CHANGE_VALUE_TICK_DELAY,
    startDelay: _constants.START_AUTO_CHANGE_DELAY,
    scrollDistance: _constants.SCROLLING_POINTER_MOVE_DISTANCE,
    tick(triggerEvent) {
      const amount = getStepAmount(triggerEvent) ?? _constants.DEFAULT_STEP;
      return incrementValue(amount, {
        direction: isIncrement ? 1 : -1,
        event: triggerEvent,
        reason: pressReason
      });
    },
    onStop(nativeEvent) {
      const committed = lastChangedValueRef.current ?? valueRef.current;
      onValueCommitted(committed, (0, _createBaseUIEventDetails.createGenericEventDetails)(pressReason, nativeEvent));
    }
  });
  const props = {
    disabled,
    'aria-readonly': readOnly || undefined,
    'aria-label': isIncrement ? 'Increase' : 'Decrease',
    'aria-controls': id,
    // Keyboard users shouldn't have access to the buttons, since they can use the input element
    // to change the value. On the other hand, `aria-hidden` is not applied because touch screen
    // readers should be able to use the buttons.
    tabIndex: -1,
    style: {
      WebkitUserSelect: 'none',
      userSelect: 'none'
    },
    ...pointerHandlers,
    onClick(event) {
      const isDisabled = disabled || readOnly;
      if (event.defaultPrevented || isDisabled || shouldSkipClick(event)) {
        return;
      }
      commitValue(event.nativeEvent);
      const amount = getStepAmount(event) ?? _constants.DEFAULT_STEP;
      const prev = valueRef.current;
      incrementValue(amount, {
        direction: isIncrement ? 1 : -1,
        event: event.nativeEvent,
        reason: pressReason
      });
      const committed = lastChangedValueRef.current ?? valueRef.current;
      if (committed !== prev) {
        onValueCommitted(committed, (0, _createBaseUIEventDetails.createGenericEventDetails)(pressReason, event.nativeEvent));
      }
    },
    onPointerDown(event) {
      const isMainButton = !event.button || event.button === 0;
      if (event.defaultPrevented || readOnly || !isMainButton || disabled) {
        return;
      }

      // Sync dirty input value before starting the hold sequence.
      commitValue(event.nativeEvent);
      if (!isTouchLikePointerType(event.pointerType)) {
        // Focus the input so the user can continue with keyboard interactions.
        inputRef.current?.focus();
      }
      pointerHandlers.onPointerDown(event);
    }
  };
  return props;
}