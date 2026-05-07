'use client';

import * as React from 'react';
import { useStore } from '@base-ui/utils/store';
import { EMPTY_OBJECT } from '@base-ui/utils/empty';
import { useRenderElement } from "../../internals/useRenderElement.js";
import { ComboboxChipsContext } from "./ComboboxChipsContext.js";
import { CompositeList } from "../../internals/composite/list/CompositeList.js";
import { useComboboxRootContext } from "../root/ComboboxRootContext.js";
import { selectors } from "../store.js";
import { handleInputPress } from "../utils/handleInputPress.js";

/**
 * A container for the chips in a multiselectable input.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Combobox](https://base-ui.com/react/components/combobox)
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const ComboboxChips = /*#__PURE__*/React.forwardRef(function ComboboxChips(componentProps, forwardedRef) {
  const {
    render,
    className,
    style,
    ...elementProps
  } = componentProps;
  const store = useComboboxRootContext();
  const open = useStore(store, selectors.open);
  const hasSelectionChips = useStore(store, selectors.hasSelectionChips);
  const [highlightedChipIndex, setHighlightedChipIndex] = React.useState(undefined);
  if (open && highlightedChipIndex !== undefined) {
    setHighlightedChipIndex(undefined);
  }
  const chipsRef = React.useRef([]);
  const element = useRenderElement('div', componentProps, {
    ref: [forwardedRef, store.state.chipsContainerRef],
    // NVDA enters browse mode instead of staying in focus mode when navigating with
    // arrow keys inside a container unless it has a toolbar role.
    props: [hasSelectionChips ? {
      role: 'toolbar'
    } : EMPTY_OBJECT, {
      onMouseDown(event) {
        handleInputPress(event, store, store.state.disabled, store.state.readOnly);
      }
    }, elementProps]
  });
  const contextValue = React.useMemo(() => ({
    highlightedChipIndex,
    setHighlightedChipIndex,
    chipsRef
  }), [highlightedChipIndex, setHighlightedChipIndex, chipsRef]);
  return /*#__PURE__*/_jsx(ComboboxChipsContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsx(CompositeList, {
      elementsRef: chipsRef,
      children: element
    })
  });
});
if (process.env.NODE_ENV !== "production") ComboboxChips.displayName = "ComboboxChips";