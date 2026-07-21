'use client';

import * as React from 'react';
import { isElementDisabled } from '@base-ui/utils/isElementDisabled';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { ALL_KEYS, ARROW_DOWN, ARROW_KEYS, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, END, HOME, HORIZONTAL_KEYS, HORIZONTAL_KEYS_WITH_EXTRA_KEYS, MODIFIER_KEYS, VERTICAL_KEYS, VERTICAL_KEYS_WITH_EXTRA_KEYS, createGridCellMap, findNonDisabledListIndex, getGridCellIndexOfCorner, getGridCellIndices, getGridNavigatedIndex, getMaxListIndex, getMinListIndex, isListIndexDisabled, isIndexOutOfListBounds, isNativeInput, scrollIntoViewIfNeeded } from "../composite.js";
import { ACTIVE_COMPOSITE_ITEM } from "../constants.js";
import { getTarget } from "../../../floating-ui-react/utils.js";
const EMPTY_ARRAY = [];
export function useCompositeRoot(params) {
  const {
    itemSizes,
    cols = 1,
    loopFocus = true,
    onLoop,
    dense = false,
    orientation = 'both',
    direction,
    highlightedIndex: externalHighlightedIndex,
    onHighlightedIndexChange: externalSetHighlightedIndex,
    rootRef: externalRef,
    enableHomeAndEndKeys = false,
    stopEventPropagation = false,
    disabledIndices,
    modifierKeys = EMPTY_ARRAY
  } = params;
  const [internalHighlightedIndex, internalSetHighlightedIndex] = React.useState(0);
  const isGrid = cols > 1;
  const rootRef = React.useRef(null);
  const mergedRef = useMergedRefs(rootRef, externalRef);
  const elementsRef = React.useRef([]);
  const hasSetDefaultIndexRef = React.useRef(false);
  const highlightedIndex = externalHighlightedIndex ?? internalHighlightedIndex;
  const onHighlightedIndexChange = useStableCallback((index, shouldScrollIntoView = false) => {
    (externalSetHighlightedIndex ?? internalSetHighlightedIndex)(index);
    if (shouldScrollIntoView) {
      const newActiveItem = elementsRef.current[index];
      scrollIntoViewIfNeeded(rootRef.current, newActiveItem, direction, orientation);
    }
  });
  const onMapChange = useStableCallback(map => {
    if (map.size === 0 || hasSetDefaultIndexRef.current) {
      return;
    }
    hasSetDefaultIndexRef.current = true;
    const sortedElements = Array.from(map.keys());
    const activeItem = sortedElements.find(compositeElement => compositeElement?.hasAttribute(ACTIVE_COMPOSITE_ITEM)) ?? null;
    // Set the default highlighted index of an arbitrary composite item.
    const activeIndex = activeItem ? sortedElements.indexOf(activeItem) : -1;
    if (activeIndex !== -1) {
      onHighlightedIndexChange(activeIndex);
    }
    scrollIntoViewIfNeeded(rootRef.current, activeItem, direction, orientation);
  });
  const wrappedOnLoop = useStableCallback((event, prevIndex, nextIndex) => {
    if (!onLoop) {
      return nextIndex;
    }
    return onLoop?.(event, prevIndex, nextIndex, elementsRef);
  });
  const props = React.useMemo(() => ({
    'aria-orientation': orientation === 'both' ? undefined : orientation,
    ref: mergedRef,
    onFocus(event) {
      const element = rootRef.current;
      const target = getTarget(event.nativeEvent);
      if (!element || target == null || !isNativeInput(target)) {
        return;
      }
      target.setSelectionRange(0, target.value.length ?? 0);
    },
    onKeyDown(event) {
      const RELEVANT_KEYS = enableHomeAndEndKeys ? ALL_KEYS : ARROW_KEYS;
      if (!RELEVANT_KEYS.has(event.key)) {
        return;
      }
      if (isModifierKeySet(event, modifierKeys)) {
        return;
      }
      const element = rootRef.current;
      if (!element) {
        return;
      }
      const isRtl = direction === 'rtl';
      const horizontalForwardKey = isRtl ? ARROW_LEFT : ARROW_RIGHT;
      const forwardKey = {
        horizontal: horizontalForwardKey,
        vertical: ARROW_DOWN,
        both: horizontalForwardKey
      }[orientation];
      const horizontalBackwardKey = isRtl ? ARROW_RIGHT : ARROW_LEFT;
      const backwardKey = {
        horizontal: horizontalBackwardKey,
        vertical: ARROW_UP,
        both: horizontalBackwardKey
      }[orientation];
      const target = getTarget(event.nativeEvent);
      if (target != null && isNativeInput(target) && !isElementDisabled(target)) {
        const selectionStart = target.selectionStart;
        const selectionEnd = target.selectionEnd;
        const textContent = target.value ?? '';
        // return to native textbox behavior when
        // 1 - Shift is held to make a text selection, or if there already is a text selection
        if (selectionStart == null || event.shiftKey || selectionStart !== selectionEnd) {
          return;
        }
        // 2 - arrow-ing forward and not in the last position of the text
        if (event.key !== backwardKey && selectionStart < textContent.length) {
          return;
        }
        // 3 -arrow-ing backward and not in the first position of the text
        if (event.key !== forwardKey && selectionStart > 0) {
          return;
        }
      }
      let nextIndex = highlightedIndex;
      const minIndex = getMinListIndex(elementsRef, disabledIndices);
      const maxIndex = getMaxListIndex(elementsRef, disabledIndices);
      if (isGrid) {
        const sizes = itemSizes || Array.from({
          length: elementsRef.current.length
        }, () => ({
          width: 1,
          height: 1
        }));
        // To calculate movements on the grid, we use hypothetical cell indices
        // as if every item was 1x1, then convert back to real indices.
        const cellMap = createGridCellMap(sizes, cols, dense);
        const minGridIndex = cellMap.findIndex(index => index != null && !isListIndexDisabled(elementsRef.current, index, disabledIndices));
        // last enabled index
        const maxGridIndex = cellMap.reduce((foundIndex, index, cellIndex) => index != null && !isListIndexDisabled(elementsRef.current, index, disabledIndices) ? cellIndex : foundIndex, -1);
        nextIndex = cellMap[getGridNavigatedIndex(cellMap.map(itemIndex => itemIndex != null ? elementsRef.current[itemIndex] : null), {
          event,
          orientation,
          loopFocus,
          onLoop: wrappedOnLoop,
          cols,
          // treat undefined (empty grid spaces) as disabled indices so we
          // don't end up in them
          disabledIndices: getGridCellIndices([...(disabledIndices || elementsRef.current.map((_, index) => isListIndexDisabled(elementsRef.current, index) ? index : undefined)), undefined], cellMap),
          minIndex: minGridIndex,
          maxIndex: maxGridIndex,
          prevIndex: getGridCellIndexOfCorner(highlightedIndex > maxIndex ? minIndex : highlightedIndex, sizes, cellMap, cols,
          // use a corner matching the edge closest to the direction we're
          // moving in so we don't end up in the same item. Prefer
          // top/left over bottom/right.
          // eslint-disable-next-line no-nested-ternary
          event.key === ARROW_DOWN ? 'bl' : event.key === ARROW_RIGHT ? 'tr' : 'tl'),
          rtl: isRtl
        })]; // navigated cell will never be nullish
      }
      const forwardKeys = {
        horizontal: [horizontalForwardKey],
        vertical: [ARROW_DOWN],
        both: [horizontalForwardKey, ARROW_DOWN]
      }[orientation];
      const backwardKeys = {
        horizontal: [horizontalBackwardKey],
        vertical: [ARROW_UP],
        both: [horizontalBackwardKey, ARROW_UP]
      }[orientation];
      const preventedKeys = isGrid ? RELEVANT_KEYS : {
        horizontal: enableHomeAndEndKeys ? HORIZONTAL_KEYS_WITH_EXTRA_KEYS : HORIZONTAL_KEYS,
        vertical: enableHomeAndEndKeys ? VERTICAL_KEYS_WITH_EXTRA_KEYS : VERTICAL_KEYS,
        both: RELEVANT_KEYS
      }[orientation];
      if (enableHomeAndEndKeys) {
        if (event.key === HOME) {
          nextIndex = minIndex;
        } else if (event.key === END) {
          nextIndex = maxIndex;
        }
      }
      if (nextIndex === highlightedIndex && (forwardKeys.includes(event.key) || backwardKeys.includes(event.key))) {
        if (loopFocus && nextIndex === maxIndex && forwardKeys.includes(event.key)) {
          nextIndex = minIndex;
          if (onLoop) {
            nextIndex = onLoop(event, highlightedIndex, nextIndex, elementsRef);
          }
        } else if (loopFocus && nextIndex === minIndex && backwardKeys.includes(event.key)) {
          nextIndex = maxIndex;
          if (onLoop) {
            nextIndex = onLoop(event, highlightedIndex, nextIndex, elementsRef);
          }
        } else {
          nextIndex = findNonDisabledListIndex(elementsRef.current, {
            startingIndex: nextIndex,
            decrement: backwardKeys.includes(event.key),
            disabledIndices
          });
        }
      }
      if (nextIndex !== highlightedIndex && !isIndexOutOfListBounds(elementsRef.current, nextIndex)) {
        if (stopEventPropagation) {
          event.stopPropagation();
        }
        if (preventedKeys.has(event.key)) {
          event.preventDefault();
        }
        onHighlightedIndexChange(nextIndex, true);

        // Wait for FocusManager `returnFocus` to execute.
        queueMicrotask(() => {
          elementsRef.current[nextIndex]?.focus();
        });
      }
    }
  }), [cols, dense, direction, disabledIndices, elementsRef, enableHomeAndEndKeys, highlightedIndex, isGrid, itemSizes, loopFocus, onLoop, wrappedOnLoop, mergedRef, modifierKeys, onHighlightedIndexChange, orientation, stopEventPropagation]);
  return React.useMemo(() => ({
    props,
    highlightedIndex,
    onHighlightedIndexChange,
    elementsRef,
    disabledIndices,
    onMapChange,
    relayKeyboardEvent: props.onKeyDown
  }), [props, highlightedIndex, onHighlightedIndexChange, elementsRef, disabledIndices, onMapChange]);
}
function isModifierKeySet(event, ignoredModifierKeys) {
  for (const key of MODIFIER_KEYS.values()) {
    if (ignoredModifierKeys.includes(key)) {
      continue;
    }
    if (event.getModifierState(key)) {
      return true;
    }
  }
  return false;
}